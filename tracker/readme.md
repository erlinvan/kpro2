## Dependencies
### nRF52 SDK 17
#### Download
[https://www.nordicsemi.com/Software-and-tools/Software/nRF5-SDK/Download](https://www.nordicsemi.com/Software-and-tools/Software/nRF5-SDK/Download)
#### Documentation
[https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v15.2.0%2Fgroup__nrf__gpio.html](https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v15.2.0%2Fgroup__nrf__gpio.html)

### arm-none-eabi-gcc
#### MacOS X installation
`brew install osx-cross/arm/arm-gcc-bin`

### nrfjprog
#### Download
[https://www.nordicsemi.com/Software-and-tools/Development-Tools/nRF-Command-Line-Tools/Download](https://www.nordicsemi.com/Software-and-tools/Development-Tools/nRF-Command-Line-Tools/Download)

## Setup
### SDK
Place SDK in repository root.
Possibly change `GNU_INSTALL_ROOT` in `SDK_ROOT/components/toolchain/gcc/Makfile.posix`.


## Usage
`cd tracker/pca10056e/s140/armgcc`

`make`

`make flash_softdevice`

`make flash`
