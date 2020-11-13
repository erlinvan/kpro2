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
#include <time.h>
#include "nordic_common.h"
#include "nrf.h"
#include "ble_advertising.h"
#include "nrf_sdh.h"
#include "nrf_sdh_ble.h"
#include "app_timer.h"
#include "fds.h"
#include "bsp.h"
#include "fds_internal_defs.h"
#include "app_uart.h"
#include "nrf_drv_gpiote.h"
#include "bsp_btn_ble.h"
#include "nrf_pwr_mgmt.h"
#include "nrf_ble_scan.h"
#include "nrf_drv_timer.h"
//#include "nrfx_timer.h"

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
#define UART_HWFC APP_UART_FLOW_CONTROL_DISABLED

#define USE_TRACKER_UART_PINS
#define TRACKER_RX_PIN_NUMBER NRF_GPIO_PIN_MAP(0,12)
#define TRACKER_TX_PIN_NUMBER NRF_GPIO_PIN_MAP(0,14)
#define TRACKER_CTS_PIN_NUMBER NRF_GPIO_PIN_MAP(0,15)
#define TRACKER_RTS_PIN_NUMBER NRF_GPIO_PIN_MAP(0,16)

// Tag for identifying SoftDevice BLE configuration
#define APP_BLE_CONN_CFG_TAG 1

#define SCAN_DURATION_WITELIST 3000

#define DEV_NAME_LEN ((BLE_GAP_ADV_SET_DATA_SIZE_MAX + 1) - AD_DATA_OFFSET)

NRF_BLE_SCAN_DEF(m_scan);

const nrf_drv_timer_t TIMER_INSTANCE = NRF_DRV_TIMER_INSTANCE(1);

const uint8_t address_prefix[4] = {0xac, 0x23, 0x3f, 0xa4};
const uint8_t manufactor_specific_uuid[3] = {0x03, 0xe1, 0xff};

#define DONT_USE_FLASH_STORAGE
#define FILE_ID 0x1234
#define RECORD_KEY 0x1234

#define BEACON_DATA_CAPACITY 32

#define FAULT_THRESHOLD 2
#define TIMER_SCAN_INTERVAL 2
#define TIMER_SECONDS 5
// Scan for TIMER_SECONDS seconds
// Sleep for TIMER_SECONDS*TIMER_SCAN_INTERVAL seconds

typedef struct {
    uint8_t bytes[6];
} mac_address_t;

typedef struct {
    uint8_t bytes[2];
} float8dot8_t;

typedef struct {
    mac_address_t mac_address;
    float8dot8_t temperature;
    float8dot8_t humidity;
} beacon_data_t;

static beacon_data_t beacon_data[BEACON_DATA_CAPACITY] = {};
static size_t beacon_data_size = 0;


static const ble_gap_scan_params_t m_scan_param =
{
    .active        = 0x01,
    .interval      = NRF_BLE_SCAN_SCAN_INTERVAL,
    .window        = NRF_BLE_SCAN_SCAN_WINDOW,
    .filter_policy = BLE_GAP_SCAN_FP_ACCEPT_ALL,
    .timeout       = SCAN_DURATION_WITELIST,
    .scan_phys     = BLE_GAP_PHY_1MBPS,
};

#define USE_FAULT_COUNTER
static size_t fault_counter = 0;
static size_t timer_counter = 0;
static size_t beacons_found_during_scan = 0;
static size_t timestamp_counter = 0;


static ret_code_t handle_error(ret_code_t ret_code) {
    APP_ERROR_CHECK(ret_code);
    if (ret_code != NRF_SUCCESS) {
        //app_uart_flush();
        //app_uart_put('n');
    }

    return ret_code;
}


static void ble_stack_init(void) {
    handle_error(
        nrf_sdh_enable_request()
    );

    // Configure the BLE stack using the default settings.
    // Fetch the start address of the application RAM.
    uint32_t ram_start = 0;
    handle_error(
        nrf_sdh_ble_default_cfg_set(APP_BLE_CONN_CFG_TAG, &ram_start)
    );

    // Enable BLE stack.
    handle_error(
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
#ifdef USE_TRACKER_UART_PINS
    app_uart_comm_params_t const comm_params =
    {
        .rx_pin_no    = TRACKER_RX_PIN_NUMBER,
        .tx_pin_no    = TRACKER_TX_PIN_NUMBER,
        .rts_pin_no   = TRACKER_RTS_PIN_NUMBER,
        .cts_pin_no   = TRACKER_CTS_PIN_NUMBER,
        .flow_control = APP_UART_FLOW_CONTROL_DISABLED,
        .use_parity   = false,
#if defined (UART_PRESENT)
        .baud_rate    = NRF_UART_BAUDRATE_115200
#else
        .baud_rate    = NRF_UARTE_BAUDRATE_115200
#endif
    };
#else
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
#endif

    uint32_t err_code;
    APP_UART_FIFO_INIT(
        &comm_params,
        UART_RX_BUF_SIZE,
        UART_TX_BUF_SIZE,
        uart_error_handle,
        APP_IRQ_PRIORITY_LOWEST,
        err_code
    );
    handle_error(err_code);
}

static void power_management_init(void) {
    handle_error(
        nrf_pwr_mgmt_init()
    );
}


static void scan_start(void) {
    handle_error(nrf_ble_scan_start(&m_scan));
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

// Check if mac address in data packet matches mac address of device
static bool mac_address_location_match(const ble_gap_evt_adv_report_t* p_adv_report) {
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


static bool data_match_frametype(const ble_data_t data) {
    if (
      data.p_data[11] == 0xa1
    ) {
        return true;
    }
    return false;
}

static bool data_match_uuid(const ble_data_t data) {
    if (
      data.p_data[4] == manufactor_specific_uuid[0] &&
      data.p_data[5] == manufactor_specific_uuid[1] &&
      data.p_data[6] == manufactor_specific_uuid[2] &&
      data.p_data[9] == manufactor_specific_uuid[1] &&
      data.p_data[10] == manufactor_specific_uuid[2]
    ) {
        return true;
    }
    return false;
}

// Extract MAC address from beacon data
static mac_address_t extract_mac_address(ble_data_t data) {
    mac_address_t mac_address;
    memcpy(&mac_address, &data.p_data[18], 6);
    return mac_address;
}

// Extract temperature bytes address from beacon data
static float8dot8_t extract_temperature_bytes(ble_data_t data) {
    float8dot8_t temp;
    memcpy(&temp, &data.p_data[14], 2);
    return temp;
}

// Extract humidity bytes address from beacon data
static float8dot8_t extract_humidity_bytes(ble_data_t data) {
    float8dot8_t hum;
    memcpy(&hum, &data.p_data[16], 2);
    return hum;
}

// Check if the MAC addressed has been discovered from before. If no, add the incoming address to
// discovered_beacons.
static bool is_new_beacon(const ble_data_t data) {
    mac_address_t mac_address = extract_mac_address(data);
    for (int i = 0; i < beacon_data_size; i++) {
        if (memcmp(&beacon_data[i].mac_address, &mac_address, 6) == 0) {
            return false;
        }
    }
    return true;
}


static bool save_beacon_data(mac_address_t mac_address, float8dot8_t temperature, float8dot8_t humidity) {
    if (beacon_data_size == BEACON_DATA_CAPACITY) {
        return false;
    }

    memcpy(&beacon_data[beacon_data_size].mac_address, &mac_address, 6);
    memcpy(&beacon_data[beacon_data_size].temperature, &temperature, 2);
    memcpy(&beacon_data[beacon_data_size].humidity, &humidity, 2);
    beacon_data_size += 1;

    return true;
}


static void scan_evt_handler(scan_evt_t const * p_scan_evt) {
    if (
        address_match_prefix(p_scan_evt->params.filter_match.p_adv_report->peer_addr.addr) &&
        data_match_frametype(p_scan_evt->params.filter_match.p_adv_report->data) &&
        data_match_uuid(p_scan_evt->params.filter_match.p_adv_report->data) &&
        mac_address_location_match(p_scan_evt->params.filter_match.p_adv_report) &&
        is_new_beacon(p_scan_evt->params.filter_match.p_adv_report->data)
    ) {
        if (p_scan_evt->scan_evt_id == NRF_BLE_SCAN_EVT_SCAN_TIMEOUT) {
            scan_start();
            return;
        }

        const mac_address_t mac_address = extract_mac_address(
            p_scan_evt->params.filter_match.p_adv_report->data
        );
        const float8dot8_t temperature = extract_temperature_bytes(
            p_scan_evt->params.filter_match.p_adv_report->data
        );
        const float8dot8_t humidity = extract_humidity_bytes(
            p_scan_evt->params.filter_match.p_adv_report->data
        );

        save_beacon_data(
            mac_address,
            temperature,
            humidity
        );

#ifdef USE_FAULT_COUNTER
        beacons_found_during_scan += 1;
#endif
    }
}


static void scan_init(void) {
    nrf_ble_scan_init_t init_scan;
    memset(&init_scan, 0, sizeof(init_scan));

    init_scan.p_scan_param = &m_scan_param;
    init_scan.connect_if_match = false;
    init_scan.conn_cfg_tag = APP_BLE_CONN_CFG_TAG;

    handle_error(
        nrf_ble_scan_init(&m_scan, &init_scan, scan_evt_handler)
    );
}


static void clear_beacon_data(void) {
    beacon_data_size = 0;
}


static void print_clear_beacon_data(void) {
    const char hex[] = "0123456789abcdef";

    for (size_t i = 0; i < beacon_data_size; i++) {
        app_uart_put('[');
        app_uart_put('0');
        app_uart_put('x');
        for (size_t j = 0; j < 6; j++) {
            app_uart_put(
                hex[(beacon_data[i].mac_address.bytes[j] >> 4) & 0xf]
            );
            app_uart_put(
                hex[beacon_data[i].mac_address.bytes[j] & 0xf]
            );
        }
        app_uart_put(',');
        app_uart_put('0');
        app_uart_put('x');
        for (size_t j = 0; j < 2; j++) {
            app_uart_put(
                hex[(beacon_data[i].temperature.bytes[j] >> 4) & 0xf]
            );
            app_uart_put(
                hex[beacon_data[i].temperature.bytes[j] & 0xf]
            );
        }
        app_uart_put(',');
        app_uart_put('0');
        app_uart_put('x');
        for (size_t j = 0; j < 2; j++) {
            app_uart_put(
                hex[(beacon_data[i].humidity.bytes[j] >> 4) & 0xf]
            );
            app_uart_put(
                hex[beacon_data[i].humidity.bytes[j] & 0xf]
            );
        }
        app_uart_put(']');
    }

    clear_beacon_data();
}


void fds_evt_handler(fds_evt_t const * p_fds_evt) {
    handle_error(p_fds_evt->result);
}


#ifdef USE_FLASH_STORAGE
static void print_flash_data(const uint8_t *data, const size_t length_words) {
    printf("\r\n");
    for (size_t i = 0; i < length_words; i++) {
        printf(
            "%c%c%c%c",
            ((uint8_t *)data)[i*4 + 0],
            ((uint8_t *)data)[i*4 + 1],
            ((uint8_t *)data)[i*4 + 2],
            ((uint8_t *)data)[i*4 + 3]
        );
    }
    printf("\r\n");
}

static void write_to_flash(const uint8_t *data, const size_t length) {
    if (length == 0) {
        return;
    }

    const fds_record_t record = {
        .file_id = FILE_ID,
        .key = RECORD_KEY,
        .data.p_data = beacon_data,
        .data.length_words = length
    };

    fds_record_desc_t record_desc;
    fds_find_token_t ftok = {0};

    printf("\r\nWriting data to flash:\r\n");
    // print_flash_data(record.data.p_data, record.data.length_words);

    if (fds_record_find(FILE_ID, RECORD_KEY, &record_desc, &ftok) == NRF_SUCCESS) {
        handle_error(
            fds_record_update(&record_desc, &record)
        );
    } else {
        handle_error(
            fds_record_write(&record_desc, &record)
        );
    }
}


static void read_from_flash() {
    fds_flash_record_t  flash_record;
    fds_record_desc_t   record_desc;
    fds_find_token_t    ftok = {0};

    if (fds_record_find(FILE_ID, RECORD_KEY, &record_desc, &ftok) == NRF_SUCCESS) {
        handle_error(
            fds_record_open(&record_desc, &flash_record)
        );

        printf("\r\nReading data from flash:\r\n");
        // printf("\r\n%c\r\n", *(uint8_t *)flash_record.p_data);
        // print_flash_data(flash_record.p_data, flash_record.p_header->length_words);

        memcpy(
            beacon_data,
            flash_record.p_data,
            sizeof(beacon_data_t)*flash_record.p_header->length_words / 6
        );
        beacon_data_size = flash_record.p_header->length_words / 6;

        handle_error(
            fds_record_close(&record_desc)
        );
    }
}

static void flash_storage_init(void) {
    handle_error(
        fds_register(fds_evt_handler)
    );
    handle_error(
        fds_init()
    );
}
#endif


void timer_evt_handler(nrf_timer_event_t event, void *p_context) {

    timer_counter = (timer_counter + 1) % TIMER_SCAN_INTERVAL;
    timestamp_counter += TIMER_SECONDS;

    if (timer_counter == 0) {
#ifdef USE_FAULT_COUNTER
        beacons_found_during_scan = 0;
#endif
        nrf_pwr_mgmt_feed();
        nrf_ble_scan_start(&m_scan);
    } else if (timer_counter == 1) {
#ifdef USE_FAULT_COUNTER
        fault_counter += (beacons_found_during_scan == 0 ? 1 : 0);
        fault_counter = fault_counter % FAULT_THRESHOLD;
#else
        fault_counter = (fault_counter + 1) % FAULT_THRESHOLD;
#endif
        if (fault_counter == 0 || timestamp_counter > 60) {
            print_clear_beacon_data();
            timestamp_counter = 0;
            fault_counter = 0;
        }
        nrf_ble_scan_stop();
    }
}


static void timer_init(void) {
    nrf_drv_timer_config_t timer_config = NRF_DRV_TIMER_DEFAULT_CONFIG;
    handle_error(
        nrf_drv_timer_init(&TIMER_INSTANCE, &timer_config, timer_evt_handler)
    );

    uint32_t timer_ms = TIMER_SECONDS*1000;
    uint32_t timer_ticks = nrf_drv_timer_ms_to_ticks(&TIMER_INSTANCE, timer_ms);

    nrf_drv_timer_extended_compare(
        &TIMER_INSTANCE,
        NRF_TIMER_CC_CHANNEL1,
        timer_ticks,
        NRF_TIMER_SHORT_COMPARE1_CLEAR_MASK,
        true
    );

    nrf_drv_timer_enable(&TIMER_INSTANCE);
}


static void init_state_machine(void) {
    scan_start();
    while(true) {
        nrf_pwr_mgmt_run();
    }
}


int main(void) {
    timer_init();
    uart_init();
    power_management_init();

    ble_stack_init();
    scan_init();

#ifdef USE_FLASH_STORAGE
    flash_storage_init();
#endif

    init_state_machine();
}