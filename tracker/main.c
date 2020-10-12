/**
 * Copyright (c) 2014 - 2020, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 4. This software, with or without modification, must only be used with a
 *    Nordic Semiconductor ASA integrated circuit.
 *
 * 5. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

#include <stdint.h>
#include <string.h>
#include "nordic_common.h"
#include "nrf.h"
#include "ble_advertising.h"
#include "nrf_sdh.h"
#include "nrf_sdh_ble.h"
#include "app_timer.h"
#include "app_uart.h"
#include "app_util_platform.h"
#include "nrf_drv_gpiote.h"
#include "bsp_btn_ble.h"
#include "nrf_pwr_mgmt.h"
#include "nrf_ble_scan.h"

#if defined (UART_PRESENT)
#include "nrf_uart.h"
#endif
#if defined (UARTE_PRESENT)
#include "nrf_uarte.h"
#endif

#include "nrf_log.h"
#include "nrf_log_ctrl.h"
#include "nrf_log_default_backends.h"

#define UART_TX_BUF_SIZE 256
#define UART_RX_BUF_SIZE 256

// Tag for identifying SoftDevice BLE configuration
#define APP_BLE_CONN_CFG_TAG 1

#define SCAN_DURATION_WITELIST 3000

#define DEV_NAME_LEN ((BLE_GAP_ADV_SET_DATA_SIZE_MAX + 1) - AD_DATA_OFFSET)

NRF_BLE_SCAN_DEF(m_scan);

const uint8_t address_prefix[4] = {0xac, 0x23, 0x3f, 0xa4};

static const ble_gap_scan_params_t m_scan_param =
{
    .active        = 0x01,
    .interval      = NRF_BLE_SCAN_SCAN_INTERVAL,
    .window        = NRF_BLE_SCAN_SCAN_WINDOW,
    //TODO figure out how whitelist works
    .filter_policy = BLE_GAP_SCAN_FP_ACCEPT_ALL, //BLE_GAP_SCAN_FP_WHITELIST,
    .timeout       = SCAN_DURATION_WITELIST,
    .scan_phys     = BLE_GAP_PHY_1MBPS,
};

static bool scanning = false;


static void timers_init(void) {
    APP_ERROR_CHECK(
        app_timer_init()
    );
}


static void sleep_mode_enter(void) {
    // Prepare wakeup buttons.
    APP_ERROR_CHECK(
        bsp_btn_ble_sleep_mode_prepare()
    );

    // Go to system-off mode (this function will not return; wakeup will cause a reset).
    APP_ERROR_CHECK(
        sd_power_system_off()
    );
}


static void ble_stack_init(void) {
    APP_ERROR_CHECK(
        nrf_sdh_enable_request()
    );

    // Configure the BLE stack using the default settings.
    // Fetch the start address of the application RAM.
    uint32_t ram_start = 0;
    APP_ERROR_CHECK(
        nrf_sdh_ble_default_cfg_set(APP_BLE_CONN_CFG_TAG, &ram_start)
    );

    // Enable BLE stack.
    APP_ERROR_CHECK(
        nrf_sdh_ble_enable(&ram_start)
    );
}


void uart_error_handle(app_uart_evt_t * p_event) {
    if (p_event->evt_type == APP_UART_COMMUNICATION_ERROR) {
        APP_ERROR_HANDLER(p_event->data.error_communication);
    } else if (p_event->evt_type == APP_UART_FIFO_ERROR) {
        APP_ERROR_HANDLER(p_event->data.error_code);
    }
}


static void uart_init(void) {
    app_uart_comm_params_t const comm_params =
    {
        .rx_pin_no    = RX_PIN_NUMBER,
        .tx_pin_no    = TX_PIN_NUMBER,
        .rts_pin_no   = RTS_PIN_NUMBER,
        .cts_pin_no   = CTS_PIN_NUMBER,
        .flow_control = APP_UART_FLOW_CONTROL_DISABLED,
        .use_parity   = false,
#if defined (UART_PRESENT)
        .baud_rate    = NRF_UART_BAUDRATE_115200
#else
        .baud_rate    = NRF_UARTE_BAUDRATE_115200
#endif
    };

    uint32_t err_code;
    APP_UART_FIFO_INIT(
        &comm_params,
        UART_RX_BUF_SIZE,
        UART_TX_BUF_SIZE,
        uart_error_handle,
        APP_IRQ_PRIORITY_LOWEST,
        err_code
    );
    APP_ERROR_CHECK(err_code);
}


static void log_init(void) {
    APP_ERROR_CHECK(
        NRF_LOG_INIT(NULL)
    );

    NRF_LOG_DEFAULT_BACKENDS_INIT();
}


static void idle_state_handle(void) {
    NRF_LOG_FLUSH();
    // If threre is no pending log, sleep until next event
    if (NRF_LOG_PROCESS() == false) {
        // Enters idle state, wait for event
        nrf_pwr_mgmt_run();
    }
}


static void scan_start(void) {
    printf("\r\nStarting scan.\r\n");
    APP_ERROR_CHECK(nrf_ble_scan_start(&m_scan));
}

static bool address_match_prefix(const uint8_t *address) {
    if (
        address_prefix[0] == address[5] &&
        address_prefix[1] == address[4] &&
        address_prefix[2] == address[3] &&
        address_prefix[3] == address[2]
    ) {
        return true;
    }

    return false;
}

static void print_address(const ble_gap_evt_adv_report_t* p_adv_report) {
    printf("\r\naddr: %02x:%02x:%02x:%02x:%02x:%02x\r\n",
       p_adv_report->peer_addr.addr[5],
       p_adv_report->peer_addr.addr[4],
       p_adv_report->peer_addr.addr[3],
       p_adv_report->peer_addr.addr[2],
       p_adv_report->peer_addr.addr[1],
       p_adv_report->peer_addr.addr[0]);
}

static void print_name(const ble_gap_evt_adv_report_t* p_adv_report) {
    uint16_t offset = 0;
    char name[DEV_NAME_LEN] = { 0 };

    uint16_t length = ble_advdata_search(p_adv_report->data.p_data, p_adv_report->data.len, &offset, BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME);
    if (length == 0) {
        // Look for the short local name if it was not found as complete.
        length = ble_advdata_search(p_adv_report->data.p_data, p_adv_report->data.len, &offset, BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME);
    }

    if (length != 0) {
        memcpy(name, &p_adv_report->data.p_data[offset], length);
        printf("\r\nname: %s\r\n", nrf_log_push(name));
    }
}

static void print_manufacturer_data(const ble_gap_evt_adv_report_t* p_adv_report) {
    uint16_t offset = 0;
    uint16_t length = ble_advdata_search(p_adv_report->data.p_data, p_adv_report->data.len, &offset, BLE_GAP_AD_TYPE_MANUFACTURER_SPECIFIC_DATA);

    if (length != 0) {
        char data_string[1024] = { 0 };
        char* pos = data_string;
        for (int i = 0; i < length && i < 512; i++) {
            sprintf(pos, "%02x", p_adv_report->data.p_data[offset+i]);
            pos += 2;
        }

        printf("\r\nmanufacturer data: %s\r\n", nrf_log_push(data_string));
    }
}

static void print_data(const ble_data_t data) {
    printf("\r\n");
    for (uint16_t i = 0; i < data.len; i++) {
        printf("%02x", data.p_data[i]);
        if (i != data.len - 1) {
            printf(":");
        }
    }
    printf("\r\n");
}


// Ingrid her

// Funksjon som sjekker om MAC-adressen er på riktig sted, for å identifisere data-pakkene.
bool mac_address_location_match(const ble_gap_evt_adv_report_t* p_adv_report) {
    if (
      p_adv_report->data.p_data[18] == p_adv_report->peer_addr.addr[0] &&
      p_adv_report->data.p_data[19] == p_adv_report->peer_addr.addr[1] &&
      p_adv_report->data.p_data[20] == p_adv_report->peer_addr.addr[2] &&
      p_adv_report->data.p_data[21] == p_adv_report->peer_addr.addr[3] &&
      p_adv_report->data.p_data[22] == p_adv_report->peer_addr.addr[4] &&
      p_adv_report->data.p_data[23] == p_adv_report->peer_addr.addr[5] 
    ) {
        return true;
    }
    return false;
}

// Funksjon som sjekker frame-type byten, vet ikke om denne er nødvendig? 
bool data_match_frametype(const ble_data_t data) {
    if (
      data.p_data[11] == 0xa1
    ) {
        return true;
    }
    return false;
}


// Funksjon som oversetter fra 8.8 fixed point til float, for temperatur og luftfuktighet. 
float hex_to_float(const uint8_t integer, const uint8_t decimal){
   const float aftercomma = (float)decimal/256.0;
   return (float)integer + aftercomma;
}

// Printer temperatur
void print_temperature(const ble_data_t data){
     const float float_to_print = hex_to_float(data.p_data[14], data.p_data[15]);
     printf("\n\rTemperature: %.2fC\r\n", float_to_print);
}

// Printer luftfuktighet
void print_humidity(const ble_data_t data){
     const float float_to_print = hex_to_float(data.p_data[16], data.p_data[17]);
     printf("\n\rHumidity: %.2f%c\r\n", float_to_print, '%');
}


static void scan_evt_handler(scan_evt_t const * p_scan_evt) {

    if (address_match_prefix(p_scan_evt->params.filter_match.p_adv_report->peer_addr.addr) && 
        data_match_frametype(p_scan_evt->params.filter_match.p_adv_report->data) && 
        mac_address_location_match(p_scan_evt->params.filter_match.p_adv_report)) {
        printf("\r\nFound minew device\r\n");
    } else {
        return;
    }

    if (p_scan_evt->scan_evt_id == NRF_BLE_SCAN_EVT_SCAN_TIMEOUT) {
        printf("\r\nScan timed out.\r\n");
        scan_start();
        return;
    }


/*
    switch (p_scan_evt->params.filter_match.p_adv_report->peer_addr.addr_type) {
        case BLE_GAP_ADDR_TYPE_PUBLIC:
            printf("\r\naddress type BLE_GAP_ADDR_TYPE_PUBLIC\r\n");
            break;
        case BLE_GAP_ADDR_TYPE_RANDOM_STATIC:
            printf("\r\naddress type BLE_GAP_ADDR_TYPE_RANDOM_STATIC\r\n");
            break;
        case BLE_GAP_ADDR_TYPE_RANDOM_PRIVATE_RESOLVABLE:
            printf("\r\naddress type BLE_GAP_ADDR_TYPE_RANDOM_PRIVATE_RESOLVABLE\r\n");
            break;
        case BLE_GAP_ADDR_TYPE_RANDOM_PRIVATE_NON_RESOLVABLE:
            printf("\r\naddress type BLE_GAP_ADDR_TYPE_RANDOM_PRIVATE_NON_RESOLVABLE\r\n");
            break;
        case BLE_GAP_ADDR_TYPE_ANONYMOUS:
            printf("\r\naddress type BLE_GAP_ADDR_TYPE_ANONYMOUS\r\n");
            break;
    }*/

    print_data(p_scan_evt->params.filter_match.p_adv_report->data);
    print_address(p_scan_evt->params.filter_match.p_adv_report);
    print_name(p_scan_evt->params.filter_match.p_adv_report);
    print_temperature(p_scan_evt->params.filter_match.p_adv_report->data);
    print_humidity(p_scan_evt->params.filter_match.p_adv_report->data);
    printf("\r\nrssi: %d\r\n", p_scan_evt->params.filter_match.p_adv_report->rssi);
    print_manufacturer_data(p_scan_evt->params.filter_match.p_adv_report);
}


static void scan_init(void) {
    nrf_ble_scan_init_t init_scan;
    memset(&init_scan, 0, sizeof(init_scan));

    init_scan.p_scan_param = &m_scan_param;
    init_scan.connect_if_match = false;
    init_scan.conn_cfg_tag = APP_BLE_CONN_CFG_TAG;

    APP_ERROR_CHECK(
        nrf_ble_scan_init(&m_scan, &init_scan, scan_evt_handler)
    );
}

void button_0_handler(nrf_drv_gpiote_pin_t pin, nrf_gpiote_polarity_t action) {
    printf("\r\nButton 0 press\r\n");

    if (scanning) {
        scanning = false;
        nrf_ble_scan_stop();
        nrf_drv_gpiote_out_set(BSP_LED_0);
    } else {
        scanning = true;
        // Indicate that activity is going on
        nrf_pwr_mgmt_feed();
        nrf_ble_scan_start(&m_scan);
        nrf_drv_gpiote_out_clear(BSP_LED_0);
    }
}

void button_1_handler(nrf_drv_gpiote_pin_t pin, nrf_gpiote_polarity_t action) {
    printf("\r\nButton 1 press\r\n");

    // TODO figure out how sleep mode works
    sleep_mode_enter();
}


static void gpio_init(void) {
    APP_ERROR_CHECK(
        nrf_drv_gpiote_init()
    );

    // Enable led 0
    nrf_drv_gpiote_out_config_t out_config = GPIOTE_CONFIG_OUT_SIMPLE(false);
    APP_ERROR_CHECK(
        nrf_drv_gpiote_out_init(BSP_LED_0, &out_config)
    );

    // Sense button pressed down configuration
    nrf_drv_gpiote_in_config_t in_config =  GPIOTE_CONFIG_IN_SENSE_HITOLO(true);
    in_config.pull = NRF_GPIO_PIN_PULLUP;

    // Eanble button 0
    APP_ERROR_CHECK(
        nrf_drv_gpiote_in_init(BSP_BUTTON_0, &in_config, button_0_handler)
    );
    nrf_drv_gpiote_in_event_enable(BSP_BUTTON_0, true);

    // Enable button 1
    APP_ERROR_CHECK(
        nrf_drv_gpiote_in_init(BSP_BUTTON_1, &in_config, button_1_handler)
    );
    nrf_drv_gpiote_in_event_enable(BSP_BUTTON_1, true);
}


int main(void) {
    uart_init();
    log_init();
    timers_init();
    gpio_init();
    APP_ERROR_CHECK(nrf_pwr_mgmt_init());
    ble_stack_init();
    scan_init();

    scan_start();

    printf("\r\nEnter main loop\r\n");
    for (;;) {
        idle_state_handle();
    }
}
