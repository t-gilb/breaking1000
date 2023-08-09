/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: Przemek Gesicki - DigitWorlds (https://sketchfab.com/DigitWorlds)
license: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
source: https://sketchfab.com/3d-models/salomon-speed-cross-pro-by-digitworldscom-05049ce041f141e1977f0fb070be5dc8
title: Salomon speed cross pro by DigitWorlds.com
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/scene.gltf')
  return (
    <group ref={group} {...props} dispose={null}>
      <group position={[1.19, 6.88, -2.02]} rotation={[-2.19, 0.02, 0.11]}>
        <mesh geometry={nodes.Object_2.geometry} material={materials.material} />
      </group>
    </group>
  )
}

useGLTF.preload('/scene.gltf')
