import { NativeModules } from 'react-native';

type AutoSendSmsDualSimType = {
  multiply(a: number, b: number): Promise<number>;
};

const { AutoSendSmsDualSim } = NativeModules;

export default AutoSendSmsDualSim as AutoSendSmsDualSimType;
