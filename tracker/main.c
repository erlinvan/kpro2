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

// Tag for identifying SoftDevice BLE configuration
#define APP_BLE_CONN_CFG_TAG 1

#define SCAN_DURATION_WITELIST 3000

#define DEV_NAME_LEN ((BLE_GAP_ADV_SET_DATA_SIZE_MAX + 1) - AD_DATA_OFFSET)

NRF_BLE_SCAN_DEF(m_scan);

const nrf_drv_timer_t TIMER_INSTANCE = NRF_DRV_TIMER_INSTANCE(1);

const uint8_t address_prefix[4] = {0xac, 0x23, 0x3f, 0xa4};
const uint8_t manufactor_specific_uuid[3] = {0x03, 0xe1, 0xff};

#define FILE_ID 0x1234
#define RECORD_KEY 0x1234

#define BEACON_DATA_CAPACITY 32

typedef struct {
    uint8_t bytes[6];
} mac_address_t;

typedef struct {
    mac_address_t mac_address;
    float temperature;
    float humidity;
    uint32_t timestamp;
} beacon_data_t;

static beacon_data_t beacon_data[BEACON_DATA_CAPACITY] = {};
static size_t beacon_data_size = 0;


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

// static bool scanning = false;
#define FAULT_THRESHOLD 2
static size_t fault_counter = 0;
#define TIMER_SCAN_INTERVAL 2
static size_t timer_counter = 0;


static ret_code_t handle_error(ret_code_t ret_code) {
    APP_ERROR_CHECK(ret_code);
    if (ret_code != NRF_SUCCESS) {
        // printf("\r\nError!\r\n");
    }

    return ret_code;
}


// static void sleep_mode_enter(void) {
//     // Prepare wakeup buttons.
//     handle_error(
//         bsp_btn_ble_sleep_mode_prepare()
//     );
//
//     // Go to system-off mode (this function will not return; wakeup will cause a reset).
//     handle_error(
//         sd_power_system_off()
//     );
// }


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
    handle_error(err_code);
}


static void log_init(void) {
    handle_error(
        NRF_LOG_INIT(NULL)
    );

    NRF_LOG_DEFAULT_BACKENDS_INIT();
}


static void power_management_init(void) {
    handle_error(
        nrf_pwr_mgmt_init()
    );
}


static void scan_start(void) {
    // printf("\r\nStarting scan.\r\n");
    handle_error(nrf_ble_scan_start(&m_scan));
    // scanning = true;
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

// static void print_address(const ble_gap_evt_adv_report_t* p_adv_report) {
//     printf("\r\naddr: %02x:%02x:%02x:%02x:%02x:%02x\r\n",
//        p_adv_report->peer_addr.addr[5],
//        p_adv_report->peer_addr.addr[4],
//        p_adv_report->peer_addr.addr[3],
//        p_adv_report->peer_addr.addr[2],
//        p_adv_report->peer_addr.addr[1],
//        p_adv_report->peer_addr.addr[0]);
// }
//
// static void print_name(const ble_gap_evt_adv_report_t* p_adv_report) {
//     uint16_t offset = 0;
//     char name[DEV_NAME_LEN] = { 0 };
//
//     uint16_t length = ble_advdata_search(p_adv_report->data.p_data, p_adv_report->data.len, &offset, BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME);
//     if (length == 0) {
//         // Look for the short local name if it was not found as complete.
//         length = ble_advdata_search(p_adv_report->data.p_data, p_adv_report->data.len, &offset, BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME);
//     }
//
//     if (length != 0) {
//         memcpy(name, &p_adv_report->data.p_data[offset], length);
//         printf("\r\nname: %s\r\n", nrf_log_push(name));
//     }
// }
//
// static void print_manufacturer_data(const ble_gap_evt_adv_report_t* p_adv_report) {
//     uint16_t offset = 0;
//     uint16_t length = ble_advdata_search(p_adv_report->data.p_data, p_adv_report->data.len, &offset, BLE_GAP_AD_TYPE_MANUFACTURER_SPECIFIC_DATA);
//
//     if (length != 0) {
//         char data_string[1024] = { 0 };
//         char* pos = data_string;
//         for (int i = 0; i < length && i < 512; i++) {
//             sprintf(pos, "%02x", p_adv_report->data.p_data[offset+i]);
//             pos += 2;
//         }
//
//         printf("\r\nmanufacturer data: %s\r\n", nrf_log_push(data_string));
//     }
// }
//
// static void print_data(const ble_data_t data) {
//     printf("\r\n");
//     for (uint16_t i = 0; i < data.len; i++) {
//         printf("%02x", data.p_data[i]);
//         if (i != data.len - 1) {
//             printf(":");
//         }
//     }
//     printf("\r\n");
// }


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

// Check if the MAC addressed has been discovered from before. If no, add the incoming address to
// discovered_beacons.
static bool is_new_beacon(const ble_data_t data) {
    mac_address_t mac_address = extract_mac_address(data);
    for (int i = 0; i < beacon_data_size; i++) {
        if (memcmp(&beacon_data[i].mac_address, &mac_address, 6) == 0) {
            // printf("\n\r Beacon already discovered \n\r");
            // printf("%d", discovered_beacon_count);
            return false;
            }
        }
    // printf("\n\r New beacon! \n\r");
    return true;
}

// 8.8 fixed point byte representation to float
static float hex_to_float(const uint8_t integer, const uint8_t decimal){
   const float aftercomma = (float)decimal/256.0;
   return (float)integer + aftercomma;
}

//
// static void print_temperature(const float value){
//      printf("\n\rTemperature: %.2fC\r\n", value);
// }
//
//
// static void print_humidity(const float value) {
//      printf("\n\rHumidity: %.2f%c\r\n", value, '%');
// }

static const float extract_temperature(const ble_data_t data){
     const float temperature_value = hex_to_float(data.p_data[14], data.p_data[15]);
     return temperature_value;
}

static const float extract_humidity(const ble_data_t data){
    const float humidity_value = hex_to_float(data.p_data[16], data.p_data[17]);
    return humidity_value;
}


static bool save_beacon_data(mac_address_t mac_address, float temperature, float humidity) {
    if (beacon_data_size == BEACON_DATA_CAPACITY) {
        return false;
    }

    memcpy(&beacon_data[beacon_data_size].mac_address, &mac_address, 6);
    beacon_data[beacon_data_size].temperature = temperature;
    beacon_data[beacon_data_size].humidity = humidity;
    beacon_data[beacon_data_size].timestamp = (uint32_t)time(NULL);
    beacon_data_size += 1;

    return true;
}


static void scan_evt_handler(scan_evt_t const * p_scan_evt) {
    if (address_match_prefix(p_scan_evt->params.filter_match.p_adv_report->peer_addr.addr) &&
        data_match_frametype(p_scan_evt->params.filter_match.p_adv_report->data) &&
        data_match_uuid(p_scan_evt->params.filter_match.p_adv_report->data) &&
        mac_address_location_match(p_scan_evt->params.filter_match.p_adv_report) &&
        is_new_beacon(p_scan_evt->params.filter_match.p_adv_report->data)) {
        // printf("\r\nFound new minew device\r\n");
    } else {
        return;
    }

    if (p_scan_evt->scan_evt_id == NRF_BLE_SCAN_EVT_SCAN_TIMEOUT) {
        // printf("\r\nScan timed out.\r\n");
        scan_start();
        return;
    }

    const mac_address_t mac_address = extract_mac_address(
        p_scan_evt->params.filter_match.p_adv_report->data
    );
    const float temperature = extract_temperature(
        p_scan_evt->params.filter_match.p_adv_report->data
    );
    const float humidity = extract_humidity(
        p_scan_evt->params.filter_match.p_adv_report->data
    );

    // print_temperature(temperature);
    // print_humidity(humidity);

    // print_data(p_scan_evt->params.filter_match.p_adv_report->data);
    // print_address(p_scan_evt->params.filter_match.p_adv_report);
    // print_name(p_scan_evt->params.filter_match.p_adv_report);

    save_beacon_data(
        mac_address,
        temperature,
        humidity
    );

    // printf("\r\nrssi: %d\r\n", p_scan_evt->params.filter_match.p_adv_report->rssi);
    // printf("\n\r beacons found: %d \n\r", discovered_beacons[0]);
    // print_manufacturer_data(p_scan_evt->params.filter_match.p_adv_report);
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


// void fds_evt_handler(fds_evt_t const * p_fds_evt) {
//     handle_error(p_fds_evt->result);
//
//     printf("\r\nfds_evt_handler\r\n");
// }
//
//
// static void print_flash_data(const uint8_t *data, const size_t length_words) {
//     printf("\r\n");
//     for (size_t i = 0; i < length_words; i++) {
//         printf(
//             "%c%c%c%c",
//             ((uint8_t *)data)[i*4 + 0],
//             ((uint8_t *)data)[i*4 + 1],
//             ((uint8_t *)data)[i*4 + 2],
//             ((uint8_t *)data)[i*4 + 3]
//         );
//     }
//     printf("\r\n");
// }


static void clear_beacon_data(void) {
    beacon_data_size = 0;
}


static void print_clear_beacon_data(void) {
    printf("[");
    for (size_t i = 0; i < beacon_data_size; i++) {
        printf(
            "[%hu,%f,%f,%ld]",
            // TODO: Figure out how mac_address should be sendt
            // beacon_data[i].mac_address.bytes[5],
            // beacon_data[i].mac_address.bytes[4],
            // beacon_data[i].mac_address.bytes[3],
            // beacon_data[i].mac_address.bytes[2],
            // beacon_data[i].mac_address.bytes[1],
            beacon_data[i].mac_address.bytes[0],
            beacon_data[i].temperature,
            beacon_data[i].humidity,
            beacon_data[i].timestamp
        );
        if (i != beacon_data_size - 1) {
            printf(",");
        }
    }
    printf("]\r\n");

    clear_beacon_data();
}


// static void write_to_flash(const uint8_t *data, const size_t length) {
//     if (length == 0) {
//         return;
//     }
//
//     const fds_record_t record = {
//         .file_id = FILE_ID,
//         .key = RECORD_KEY,
//         .data.p_data = beacon_data,
//         .data.length_words = length
//     };
//
//     fds_record_desc_t record_desc;
//     fds_find_token_t ftok = {0};
//
//     printf("\r\nWriting data to flash:\r\n");
//     // print_flash_data(record.data.p_data, record.data.length_words);
//
//     if (fds_record_find(FILE_ID, RECORD_KEY, &record_desc, &ftok) == NRF_SUCCESS) {
//         handle_error(
//             fds_record_update(&record_desc, &record)
//         );
//     } else {
//         handle_error(
//             fds_record_write(&record_desc, &record)
//         );
//     }
// }
//
//
// static void read_from_flash() {
//     fds_flash_record_t  flash_record;
//     fds_record_desc_t   record_desc;
//     fds_find_token_t    ftok = {0};
//
//     if (fds_record_find(FILE_ID, RECORD_KEY, &record_desc, &ftok) == NRF_SUCCESS) {
//         handle_error(
//             fds_record_open(&record_desc, &flash_record)
//         );
//
//         printf("\r\nReading data from flash:\r\n");
//         // printf("\r\n%c\r\n", *(uint8_t *)flash_record.p_data);
//         // print_flash_data(flash_record.p_data, flash_record.p_header->length_words);
//
//         memcpy(
//             beacon_data,
//             flash_record.p_data,
//             sizeof(beacon_data_t)*flash_record.p_header->length_words / 6
//         );
//         beacon_data_size = flash_record.p_header->length_words / 6;
//
//         handle_error(
//             fds_record_close(&record_desc)
//         );
//     }
// }


// static void flash_storage_init(void) {
//     handle_error(
//         fds_register(fds_evt_handler)
//     );
//     handle_error(
//         fds_init()
//     );
// }


void timer_evt_handler(nrf_timer_event_t event, void *p_context) {
    // printf("\r\nTimer\r\n");

    timer_counter = (timer_counter + 1) % TIMER_SCAN_INTERVAL;

    if (timer_counter == 0) {
        nrf_pwr_mgmt_feed();
        nrf_ble_scan_start(&m_scan);
        // nrf_drv_gpiote_out_clear(BSP_LED_0);
    } else if (timer_counter == 1) {

        // TODO: This sould be moved somewhere else
        fault_counter = (fault_counter + 1) % FAULT_THRESHOLD;

        if (fault_counter == 0) {
            print_clear_beacon_data();
        }
        nrf_ble_scan_stop();
        // nrf_drv_gpiote_out_set(BSP_LED_0);
    }
}


static void timer_init(void) {
    nrf_drv_timer_config_t timer_config = NRF_DRV_TIMER_DEFAULT_CONFIG;
    handle_error(
        nrf_drv_timer_init(&TIMER_INSTANCE, &timer_config, timer_evt_handler)
    );

    uint32_t timer_ms = 5000;
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


// void button_0_handler(nrf_drv_gpiote_pin_t pin, nrf_gpiote_polarity_t action) {
//     printf("\r\nButton 0 press\r\n");
//
//     if (scanning) {
//         scanning = false;
//         nrf_ble_scan_stop();
//         nrf_drv_gpiote_out_set(BSP_LED_0);
//     } else {
//         scanning = true;
//         // Indicate that activity is going on
//         nrf_pwr_mgmt_feed();
//         nrf_ble_scan_start(&m_scan);
//         nrf_drv_gpiote_out_clear(BSP_LED_0);
//     }
// }
//
// void button_1_handler(nrf_drv_gpiote_pin_t pin, nrf_gpiote_polarity_t action) {
//     printf("\r\nButton 1 press\r\n");
//     write_to_flash((void *)beacon_data, beacon_data_size*6);
//
//     // TODO figure out how sleep mode works
//     //sleep_mode_enter();
// }
//
//
// void button_2_handler(nrf_drv_gpiote_pin_t pin, nrf_gpiote_polarity_t action) {
//     printf("\r\nButton 2 press\r\n");
//
//     read_from_flash();
//
//     // TODO figure out how sleep mode works
//     //sleep_mode_enter();
// }


// void button_3_handler(nrf_drv_gpiote_pin_t pin, nrf_gpiote_polarity_t action) {
//     printf("\r\nButton 3 press\r\n");
//
//     for (size_t i = 0; i < beacon_data_size; i++) {
//         printf(
//             "\r\n[0x%02x%02x%02x%02x%02x%02x, %f, %f, %ld]\r\n",
//             beacon_data[i].mac_address.bytes[5],
//             beacon_data[i].mac_address.bytes[4],
//             beacon_data[i].mac_address.bytes[3],
//             beacon_data[i].mac_address.bytes[2],
//             beacon_data[i].mac_address.bytes[1],
//             beacon_data[i].mac_address.bytes[0],
//             beacon_data[i].temperature,
//             beacon_data[i].humidity,
//             beacon_data[i].timestamp
//         );
//     }
//
//     // TODO figure out how sleep mode works
//     //sleep_mode_enter();
// }


// static void gpio_init(void) {
//     handle_error(
//         nrf_drv_gpiote_init()
//     );
//
//     // Enable led 0
//     nrf_drv_gpiote_out_config_t out_config = GPIOTE_CONFIG_OUT_SIMPLE(false);
//     handle_error(
//         nrf_drv_gpiote_out_init(BSP_LED_0, &out_config)
//     );
//
//     // Sense button pressed down configuration
//     nrf_drv_gpiote_in_config_t in_config =  GPIOTE_CONFIG_IN_SENSE_HITOLO(true);
//     in_config.pull = NRF_GPIO_PIN_PULLUP;
//
//     // Eanble button 0
//     handle_error(
//         nrf_drv_gpiote_in_init(BSP_BUTTON_0, &in_config, button_0_handler)
//     );
//     nrf_drv_gpiote_in_event_enable(BSP_BUTTON_0, true);
//
//     // Enable button 1
//     handle_error(
//         nrf_drv_gpiote_in_init(BSP_BUTTON_1, &in_config, button_1_handler)
//     );
//     nrf_drv_gpiote_in_event_enable(BSP_BUTTON_1, true);
//
//     // Enable button 2
//     handle_error(
//         nrf_drv_gpiote_in_init(BSP_BUTTON_2, &in_config, button_2_handler)
//     );
//     nrf_drv_gpiote_in_event_enable(BSP_BUTTON_2, true);
//
//     // Enable button 3
//     handle_error(
//         nrf_drv_gpiote_in_init(BSP_BUTTON_3, &in_config, button_3_handler)
//     );
//     nrf_drv_gpiote_in_event_enable(BSP_BUTTON_3, true);
// }


static void idle_state_handle(void) {
    NRF_LOG_FLUSH();
    // If threre is no pending log, sleep until next event
    if (NRF_LOG_PROCESS() == false) {
        // Enters idle state, wait for event
        nrf_pwr_mgmt_run();
    }
}


static void init_state_machine(void) {
    scan_start();
    while(true) {
        idle_state_handle();
    }
}


int main(void) {
    timer_init();
    uart_init();
    log_init();
    // gpio_init();
    power_management_init();

    ble_stack_init();
    scan_init();
    // flash_storage_init();
    // app_timer_init();

    init_state_machine();
}
