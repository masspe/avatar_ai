import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import {
  VRMLoaderPlugin,
  VRMUtils,
} from "https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.0.7/lib/three-vrm.module.js";

const conversation = [
  {
    role: "system",
    content: "Sei un assistente virtuale che spiega convenzioni con tono amichevole.",
  },
];

const messageTemplate = document.getElementById("message-template");
const messagesContainer = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const submitButton = form.querySelector("button");

function appendMessage(role, content) {
  const clone = messageTemplate.content.cloneNode(true);
  const root = clone.querySelector(".message");
  root.classList.add(role);
  clone.querySelector(".role").textContent = `${role}:`;
  clone.querySelector(".content").textContent = content;
  messagesContainer.appendChild(clone);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

appendMessage(
  "assistant",
  "Ciao! Sono il tuo assistente virtuale. Come posso aiutarti oggi?"
);
conversation.push({
  role: "assistant",
  content: "Ciao! Sono il tuo assistente virtuale. Come posso aiutarti oggi?",
});

function setPending(isPending) {
  submitButton.disabled = isPending;
  submitButton.textContent = isPending ? "Invio..." : "Invia";
  input.disabled = isPending;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }

  appendMessage("user", text);
  conversation.push({ role: "user", content: text });

  input.value = "";
  setPending(true);

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation }),
    });

    if (!response.ok) {
      throw new Error(`Errore ${response.status}`);
    }

    const { reply, audio, error } = await response.json();

    if (error) {
      throw new Error(error);
    }

    if (reply) {
      conversation.push({ role: "assistant", content: reply });
      appendMessage("assistant", reply);
    }

    if (audio) {
      const audioElement = new Audio(`data:audio/mp3;base64,${audio}`);
      audioElement.play().catch(() => {
        console.warn("Riproduzione audio non consentita automaticamente.");
      });
    }
  } catch (error) {
    console.error(error);
    appendMessage(
      "assistant",
      "Si è verificato un errore nel contattare il server. Riprova più tardi."
    );
  } finally {
    setPending(false);
    input.focus();
  }
});

// --- Avatar setup ---------------------------------------------------------
const container = document.getElementById("avatar-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
camera.position.set(0, 1.4, 2.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.target.set(0, 1.35, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 2.2);
light.position.set(1, 1.8, 1.2);
scene.add(light);

const rimLight = new THREE.DirectionalLight(0x6ee7b7, 0.8);
rimLight.position.set(-1, 1.6, -0.6);
scene.add(rimLight);

const ambient = new THREE.AmbientLight(0x64748b, 0.6);
scene.add(ambient);

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

const AVATAR_URL =
  "https://cdn.jsdelivr.net/gh/pixiv/three-vrm@2.0.7/packages/three-vrm/examples/models/VRM1/VRM1_Constraint_Twist_Sample.vrm";

let currentVrm = null;

loader.load(
  AVATAR_URL,
  (gltf) => {
    VRMUtils.removeUnnecessaryJoints(gltf.scene);
    VRMUtils.removeUnnecessaryVertices(gltf.scene);

    const vrm = gltf.userData.vrm;
    vrm.scene.rotation.y = Math.PI;
    scene.add(vrm.scene);
    currentVrm = vrm;
  },
  undefined,
  (error) => {
    console.error("Impossibile caricare l'avatar", error);
  }
);

const clock = new THREE.Clock();

function resizeRenderer() {
  const { clientWidth, clientHeight } = container;
  if (clientWidth === 0 || clientHeight === 0) {
    return;
  }
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  if (currentVrm) {
    currentVrm.update(delta);
  }
  renderer.render(scene, camera);
});
