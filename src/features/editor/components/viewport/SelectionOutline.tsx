import { Outlines } from '@react-three/drei';

interface SelectionOutlineProps {
  visible: boolean;
}

function SelectionOutline({ visible }: SelectionOutlineProps) {
  if (!visible) return null;
  return <Outlines thickness={2} color="#f97316" />;
}

export default SelectionOutline;
