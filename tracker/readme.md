## Dependencies
### nRF52 SDK
#### Download
[https://www.nordicsemi.com/Software-and-tools/Software/nRF5-SDK/Download](https://www.nordicsemi.com/Software-and-tools/Software/nRF5-SDK/Download)
#### Documentation
[https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v15.2.0%2Fgroup__nrf__gpio.html](https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v15.2.0%2Fgroup__nrf__gpio.html)

### arm-none-eabi-gcc
#### MacOS X installation
`brew install osx-cross/arm/arm-gcc-bin`

## Setup
### SDK
In *makefile* set the variable `SDK_ROOT` to the path to the SDK

## Usage

`make`

`make flash`
