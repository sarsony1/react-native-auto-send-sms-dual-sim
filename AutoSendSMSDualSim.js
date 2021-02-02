import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { AutoSendSmsDualSim } = NativeModules;

export const sendSmsFromSubscriptionIndex = async (
  simIndex,
  destAddress,
  msgBody,
  callback
) => {
  const setUpStatus = await prepareSendSMS(callback);
  if (!setUpStatus) {
    return;
  } else {
    AutoSendSmsDualSim.sendSmsFromSlotIndex(
      simIndex,
      destAddress,
      msgBody,
      (result) => callback('success', result),
      (result) => callback('failed', result)
    );
  }
};

export const getPhoneNumberList = async (callback) => {
  const setUpStatus = await prepareSendSMS(callback);
  if (!setUpStatus) {
    return;
  } else {
    return AutoSendSmsDualSim.getPhoneNumberList();
  }
};

const hasPhoneStateReadPermission = async () => {
  if (Platform.Version < 22) {
    return true;
  }

  return await PermissionsAndroid.check(PermissionsAndroid.READ_PHONE_STATE);
};

const requestPhoneStateAccess = async (callback) => {
  const hasPhoneStateAccess = await hasPhoneStateReadPermission();
  if (hasPhoneStateAccess) return true;
  else {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.READ_PHONE_STATE
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      callback('failed', 'Read phone state permission denied');
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      callback('failed', 'Read phone state revoked by user');
    }
    return false;
  }
};

export const prepareSendSMS = async (callback) => {
  if (Platform.OS === 'android') {
    const hasReadPhoneStatePermission = await requestPhoneStateAccess();
    if (hasReadPhoneStatePermission) {
      AutoSendSmsDualSim.prepareSendSMS();
      return true;
    }
    return false;
  }
  return false;
};
