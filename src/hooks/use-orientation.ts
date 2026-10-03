import { useWindowDimensions } from 'react-native';

export function useOrientation() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isLandscape: width > height,
  };
}
