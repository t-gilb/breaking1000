import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Model({ scroll, ...props }) {
  const group = useRef();

  const { nodes, materials } = useGLTF("/shoe/scene.gltf");

  useFrame((state) => {
    const offset = 1 - scroll.current;
    state.camera.position.set(
      Math.sin(offset) * -10,
      Math.atan(offset * Math.PI * 6) * 5,
      Math.cos(offset * Math.PI) * -30
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group
      position={[0, -6, 0]}
      //rotation={[Math.PI, 0, 0]}
      ref={group}
      {...props}
      dispose={null}
    >
      <group position={[1.19, 4.88, 8]} rotation={[-2.19, 0.02, 0.11]}>
        <mesh
          geometry={nodes.Object_2.geometry}
          material={materials.material}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/shoe/scene.gltf");
