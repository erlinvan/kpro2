SOURCE_DIR = src
OBJECT_DIR = obj
INCLUDE_DIR = inc

DEVICE = nrf52
CHIP_NAME = nRF52840
DEVICE_UC = NRF52
DEVICE_VARIANT = xxaa

SDK_ROOT = nRF5_SDK_17.0.0_9d13099

SOURCES = $(shell find $(SOURCE_DIR) -name '*.c')
PROG_NAME = tracker

GNU_PREFIX = arm-none-eabi

CC = $(GNU_PREFIX)-gcc
OBJDUMP = $(GNU_PREFIX)-objdump
OBJCOPY = $(GNU_PREFIX)-objcopy

CFLAGS = -mcpu=cortex-m4 -mthumb -mabi=aapcs -mfpu=fpv4-sp-d16 -mfloat-abi=hard
LINKER_SCRIPT = $(SDK_ROOT)/modules/nrfx/mdk/$(DEVICE)_$(DEVICE_VARIANT).ld

CFLAGS += -ffunction-sections -fdata-sections -fno-strict-aliasing -fno-builtin --short-enums
CFLAGS += -std=gnu11 -Wall -D$(DEVICE_UC)

CFLAGS += -T $(LINKER_SCRIPT)
CFLAGS += -L $(SDK_ROOT)/components/toolchain/gcc
CFLAGS += -L $(SDK_ROOT)/modules/nrfx/mdk

CFLAGS += -I$(INCLUDE_DIR)
CFLAGS += -I$(SDK_ROOT)/components
CFLAGS += -I$(SDK_ROOT)/components/boards
CFLAGS += -I$(SDK_ROOT)/components/drivers_nrf/nrf_soc_nosd
CFLAGS += -I$(SDK_ROOT)/components/libraries/
CFLAGS += -I$(SDK_ROOT)/components/libraries/atomic
CFLAGS += -I$(SDK_ROOT)/components/libraries/balloc
CFLAGS += -I$(SDK_ROOT)/components/libraries/bsp
CFLAGS += -I$(SDK_ROOT)/components/libraries/experimental_section_vars
CFLAGS += -I$(SDK_ROOT)/components/libraries/log
CFLAGS += -I$(SDK_ROOT)/components/libraries/log/src
CFLAGS += -I$(SDK_ROOT)/components/libraries/memobj
CFLAGS += -I$(SDK_ROOT)/components/libraries/ringbuf
CFLAGS += -I$(SDK_ROOT)/components/libraries/strerror
CFLAGS += -I$(SDK_ROOT)/components/libraries/util
CFLAGS += -I$(SDK_ROOT)/components/toolchain/cmsis/include
CFLAGS += -I$(SDK_ROOT)/external/fprintf
CFLAGS += -I$(SDK_ROOT)/integration/nrfx
CFLAGS += -I$(SDK_ROOT)/integration/nrfx/legacy
CFLAGS += -I$(SDK_ROOT)/modules/nrfx
CFLAGS += -I$(SDK_ROOT)/modules/nrfx/drivers/include
CFLAGS += -I$(SDK_ROOT)/modules/nrfx/hal
CFLAGS += -I$(SDK_ROOT)/modules/nrfx/mdk
CFLAGS += -I$(SDK_ROOT)/modules/nrfx/templates
CFLAGS += -I$(SDK_ROOT)/modules/nrfx/templates/$(CHIP_NAME)

SOURCES += $(SDK_ROOT)/components/boards/boards.c
SOURCES += $(SDK_ROOT)/components/libraries/atomic/nrf_atomic.c
SOURCES += $(SDK_ROOT)/components/libraries/balloc/nrf_balloc.c
SOURCES += $(SDK_ROOT)/components/libraries/log/src/nrf_log_frontend.c
SOURCES += $(SDK_ROOT)/components/libraries/log/src/nrf_log_str_formatter.c
SOURCES += $(SDK_ROOT)/components/libraries/memobj/nrf_memobj.c
SOURCES += $(SDK_ROOT)/components/libraries/ringbuf/nrf_ringbuf.c
SOURCES += $(SDK_ROOT)/components/libraries/strerror/nrf_strerror.c
SOURCES += $(SDK_ROOT)/components/libraries/util/app_error.c
SOURCES += $(SDK_ROOT)/components/libraries/util/app_error_handler_gcc.c
SOURCES += $(SDK_ROOT)/components/libraries/util/app_error_weak.c
SOURCES += $(SDK_ROOT)/components/libraries/util/app_util_platform.c
SOURCES += $(SDK_ROOT)/components/libraries/util/nrf_assert.c
SOURCES += $(SDK_ROOT)/external/fprintf/nrf_fprintf.c
SOURCES += $(SDK_ROOT)/external/fprintf/nrf_fprintf_format.c
SOURCES += $(SDK_ROOT)/modules/nrfx/drivers/src/nrfx_gpiote.c
SOURCES += $(SDK_ROOT)/modules/nrfx/mdk/gcc_startup_$(DEVICE).S
SOURCES += $(SDK_ROOT)/modules/nrfx/mdk/system_$(DEVICE).c
SOURCES += $(SDK_ROOT)/modules/nrfx/soc/nrfx_atomic.c

CFLAGS += -DBOARD_PCA10056
CFLAGS += -DCONFIG_GPIO_AS_PINRESET
CFLAGS += -DNRF52840_XXAA
CFLAGS += -DFLOAT_ABI_HARD
CFLAGS += -DBSP_DEFINES_ONLY

all:
	$(CC) $(CFLAGS) $(SOURCES) -o $(PROG_NAME).elf
	$(OBJCOPY) -Oihex $(PROG_NAME).elf $(PROG_NAME).hex
	$(OBJCOPY) -Obinary $(PROG_NAME).elf $(PROG_NAME).bin

flash:
	nrfjprog -f NRF52 --program $(PROG_NAME).hex --chiperase --verify
	nrfjprog -f NRF52 --reset

clean:
	rm $(PROG_NAME).elf $(PROG_NAME).o $(PROG_NAME).hex $(PROG_NAME).bin
	rm system_$(DEVICE).o
	rm gcc_startup_$(DEVICE).o
