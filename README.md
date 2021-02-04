# react-native-auto-send-sms-dual-sim

A react native library to that will enable users to send SMS from custom SIM from React native.
Hasn't published to npm yet.

## Installation

```sh
npm install react-native-auto-send-sms-dual-sim
```

## Usage

You can refer to the example android for ref.

The API's exposed are shown below 

```js
import AutoSendSmsDualSim from "react-native-auto-send-sms-dual-sim";

// Guide for isSimChooserNeeded API 
var hasRequiredPermissions = false;
    const isSimChooserNeeded = await AutoSendSmsDualSim.isSimChooserNeeded(
      (status: string) => {
        if (status === 'Success') {
          hasRequiredPermissions = true;
        }
      }
    );
    if (hasRequiredPermissions) {
      if (isSimChooserNeeded) {
        // Use getPhoneNumberList API
      } else {
        AutoSendSmsDualSim.sendSmsFromSlotIndex(
          null,
          number,
          message,
          callback
        );
      }
    }
    
// Guide for getPhoneNumberList API 

AutoSendSmsDualSim.getPhoneNumberList(
          (phoneNumberJsonString: string) => {
            const phoneNumberJson = JSON.parse(phoneNumberJsonString);
            console.log(`${phoneNumberJson.SIM_0} : ${phoneNumberJson.SIM_1}`);
          }
        );
        
 // Guide for sendSmsFromSlotIndex API
 
 AutoSendSmsDualSim.sendSmsFromSlotIndex(
          simIndex = null, // null if you want to send by default SIM or index 0 or 1 for SIM_1 and SIM_2
          destAddress = number,
          msgBody = message,
          callback = (status, message) => {
          if( status === 'Success'){
          }else{}
          }
        );

```

Android Permissions Needed

<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.SEND_SMS"/>

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
