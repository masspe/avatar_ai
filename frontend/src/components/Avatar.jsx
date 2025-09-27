import { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";

export function Avatar() {
  const ref = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    camera.position.set(0, 1.4, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 600);
    ref.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    fetch("https://models.readyplayer.me/642b7f7b7/model.glb")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        VRM.from(buffer).then(vrm => {
          scene.add(vrm.scene);
          renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
          });
        });
      });
  }, []);

  return <div ref={ref}></div>;
}