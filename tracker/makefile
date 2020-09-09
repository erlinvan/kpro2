DEVICE = nrf52
CHIP_NAME = nRF52840
DEVICE_UC = NRF52
DEVICE_VARIANT = xxaa

DK_ROOT = ../../nRF5_SDK_17.0.0_9d13099

SOURCES = main.c
PROG_NAME = test

GNU_PREFIX = arm-none-eabi

CC = $(GNU_PREFIX)-gcc
OBJDUMP = $(GNU_PREFIX)-objdump
OBJCOPY = $(GNU_PREFIX)-objcopy

CFLAGS = -mcpu=cortex-m4 -mthumb -mabi=aapcs -mfpu=fpv4-sp-d16 -mfloat-abi=hard
LINKER_SCRIPT = $(DK_ROOT)/modules/nrfx/mdk/$(DEVICE)_$(DEVICE_VARIANT).ld

CFLAGS += -ffunction-sections -fdata-sections -fno-strict-aliasing -fno-builtin --short-enums
CFLAGS += -std=gnu99 -Wall -D$(DEVICE_UC)

CFLAGS += -T $(LINKER_SCRIPT)
CFLAGS += -L $(DK_ROOT)/components/toolchain/gcc
CFLAGS += -L $(DK_ROOT)/modules/nrfx/mdk

CFLAGS += -I$(DK_ROOT)/modules/nrfx
CFLAGS += -I$(DK_ROOT)/modules/nrfx/mdk
CFLAGS += -I$(DK_ROOT)/modules/nrfx/hal
CFLAGS += -I$(DK_ROOT)/modules/nrfx/drivers/include
CFLAGS += -I$(DK_ROOT)/modules/nrfx/templates/$(CHIP_NAME)
CFLAGS += -I$(DK_ROOT)/modules/nrfx/templates
CFLAGS += -I$(DK_ROOT)/components/toolchain/cmsis/include
CFLAGS += -I$(DK_ROOT)/components/libraries/
CFLAGS += -I$(DK_ROOT)/components/libraries/util
CFLAGS += -I$(DK_ROOT)/components/boards

SOURCES += $(DK_ROOT)/modules/nrfx/mdk/system_$(DEVICE).c
SOURCES += $(DK_ROOT)/modules/nrfx/mdk/gcc_startup_$(DEVICE).S
# SOURCES += $(DK_ROOT)/components/boards/boards.c

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
