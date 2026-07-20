import { Euler, Matrix4, Quaternion, Vector3 } from 'three';

import type { Vec3 } from '@/features/editor/types/scene';

export interface LocalTransform {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

function toMatrix({ position, rotation, scale }: LocalTransform): Matrix4 {
  const quaternion = new Quaternion().setFromEuler(new Euler(rotation[0], rotation[1], rotation[2]));
  return new Matrix4().compose(
    new Vector3(position[0], position[1], position[2]),
    quaternion,
    new Vector3(scale[0], scale[1], scale[2]),
  );
}

function fromMatrix(matrix: Matrix4): LocalTransform {
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  matrix.decompose(position, quaternion, scale);
  const rotation = new Euler().setFromQuaternion(quaternion);
  return {
    position: [position.x, position.y, position.z],
    rotation: [rotation.x, rotation.y, rotation.z],
    scale: [scale.x, scale.y, scale.z],
  };
}

/** reference와 같은 공간에 있는 transform을, reference를 기준으로 한 로컬 좌표로 변환한다. (그룹화 시 사용) */
export function toReferenceLocal(transform: LocalTransform, reference: LocalTransform): LocalTransform {
  const referenceMatrix = toMatrix(reference).invert();
  const worldMatrix = toMatrix(transform);
  return fromMatrix(referenceMatrix.multiply(worldMatrix));
}

/** reference를 기준으로 한 로컬 좌표를, reference와 같은 공간의 좌표로 되돌린다. (그룹 해제 시 사용) */
export function fromReferenceLocal(localTransform: LocalTransform, reference: LocalTransform): LocalTransform {
  const referenceMatrix = toMatrix(reference);
  const localMatrix = toMatrix(localTransform);
  return fromMatrix(referenceMatrix.multiply(localMatrix));
}
