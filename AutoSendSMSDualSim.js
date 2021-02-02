import { NativeModules, Platform } from 'react-native';

const { AutoSendSmsDualSim } = NativeModules;

export const sendSmsFromSubscriptionIndex = (
  simIndex,
  destAddress,
  msgBody
) => {
  if (Platform.OS === 'android') {
    AutoSendSmsDualSim.sendSmsFromSubscriptionIndex(
      simIndex,
      destAddress,
      msgBody
    );
  }
};

export const sendSmsFromDefault = (destAddress, msgBody) => {
  if (Platform.OS === 'android') {
    AutoSendSmsDualSim.sendSmsFromDefault(destAddress, msgBody);
  }
};

export const prepareSendSMS = () => {
  if (Platform.OS === 'android') {
    AutoSendSmsDualSim.prepareSendSMS();
  }
};
