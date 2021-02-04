import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { AutoSendSmsDualSim } = NativeModules;

export const sendSmsFromSlotIndex = async (
  slotIndex: number | null,
  destAddress: string,
  msgBody: string,
  callback: CallableFunction
) => {
  const hasSmsAccess = await requestReadSMSPermission();
  if (!hasSmsAccess) return;
  AutoSendSmsDualSim.sendSmsFromSlotIndex(
    slotIndex,
    destAddress,
    msgBody,
    (result: any) => callback('success', result),
    (error: any) => callback('failed', error)
  );
};

export const isSimChooserNeeded = async (callback: CallableFunction) => {
  const hasPhoneStateAccess = await requestPhoneStateAccess(callback);
  if (!hasPhoneStateAccess) {
    callback('failed');
    return false;
  }
  AutoSendSmsDualSim.prepareSendSMS();
  callback('Success');
  return AutoSendSmsDualSim.isSimChooserNeeded;
};

export const getPhoneNumberList = (callback: CallableFunction) => {
  return AutoSendSmsDualSim.getActivePhoneNumberList(callback);
};

const hasPhoneStateReadPermission = async () => {
  if (Platform.Version < 22) {
    return true;
  }

  return await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
  );
};

const requestPhoneStateAccess = async (callback: CallableFunction) => {
  const hasPhoneStateAccess = await hasPhoneStateReadPermission();
  if (hasPhoneStateAccess) return true;
  else {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      {
        title: 'Read phone state permission',
        message: 'The app needs permission to read the active subscriptions',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
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

const hasSMSPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version < 23) {
    return true;
  }
  const hasSendSmsPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.SEND_SMS
  );

  return hasSendSmsPermission;
};

export async function requestReadSMSPermission() {
  if (Platform.OS === 'android') {
    const hasPermission = await hasSMSPermission();
    if (hasPermission) {
      console.log('Already has Send SMS Permission');
      return true;
    }
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: 'Send SMS Permission',
        message: 'The app needs permission to send SMS',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      console.log('Send Sms permission denied by user.', status);
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.log('Send Sms permission revoked by user.', status);
    }
    return false;
  }
  return false;
}

export const prepareSendSMS = async (callback: CallableFunction) => {
  if (Platform.OS === 'android') {
    const hasReadPhoneStatePermission = await requestPhoneStateAccess(callback);
    if (hasReadPhoneStatePermission) {
      AutoSendSmsDualSim.prepareSendSMS();
      return true;
    }
    return false;
  }
  return false;
};
