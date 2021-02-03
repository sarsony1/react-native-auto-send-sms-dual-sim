import React, { useState } from 'react';

import {
  StyleSheet,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import AutoSendSmsDualSim from 'react-native-auto-send-sms-dual-sim';

export default function App() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [phoneNumberList, setPhoneNumberList] = useState(['123', '134']);
  const [open, setOpen] = useState(false);

  const callback = (status: string, msg: any) => {
    console.log(status + ' ' + msg);
  };

  const handleButtonClick = async () => {
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
        setOpen(true);
        AutoSendSmsDualSim.getPhoneNumberList(
          (phoneNumberJsonString: string) => {
            const phoneNumberJson = JSON.parse(phoneNumberJsonString);
            console.log(`${phoneNumberJson.SIM_0} : ${phoneNumberJson.SIM_1}`);
            setPhoneNumberList([phoneNumberJson.SIM_0, phoneNumberJson.SIM_1]);
          }
        );
      } else {
        AutoSendSmsDualSim.sendSmsFromSlotIndex(
          null,
          number,
          message,
          callback
        );
      }
    }
  };

  interface RenderProps {
    item: string;
    index: number;
  }

  const renderListItem = ({ item, index }: RenderProps) => {
    console.log('Hello there');
    console.log(`${item}: ${index}`);
    return (
      <TouchableOpacity
        onPress={() => {
          setOpen(false);
          AutoSendSmsDualSim.sendSmsFromSlotIndex(
            index,
            number,
            message,
            callback
          );
        }}
      >
        <Text>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.box}
        onChangeText={(text) => setNumber(text)}
        value={number}
        placeholder="Enter Number Here"
      />
      <TextInput
        style={styles.box}
        onChangeText={(text) => setMessage(text)}
        value={message}
        placeholder="Enter message body here"
      />
      <View style={styles.box}>
        <Button
          onPress={handleButtonClick}
          title="Send SMS"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>Choose the registered number</Dialog.Title>
          <Dialog.Content>
            <Text>Content goes here</Text>
            <FlatList
              data={phoneNumberList}
              renderItem={renderListItem}
              keyExtractor={(_item: string, index: number) => index.toString()}
            />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    height: 60,
    marginVertical: 20,
  },
});
