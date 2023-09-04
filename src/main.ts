import * as three from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const IS_MOBILE = window.innerWidth < window.innerHeight;
const canvas = document.getElementById("background");
const container = document.querySelector(".container");
const main = document.querySelector("main");

if (IS_MOBILE) {
  canvas?.classList.add("mobile");
  container?.classList.add("mobile");
  main?.classList.add("mobile");
}

console.log(`is mobile: ${IS_MOBILE}`);

function showContent() {
  const container = document.querySelector(".container") as HTMLElement | null;
  const loader = document.querySelector(".loader") as HTMLElement | null;

  if (container) container.style.display = "flex";
  if (loader) loader.style.display = "none";
}

class Rotator {
  x: number;
  y: number;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  public setX(value: number) {
    this.x = value;
  }

  public setY(value: number) {
    this.y = value;
  }
}

class Engine {
  scene: three.Scene;
  renderer: three.WebGLRenderer;
  camera: three.PerspectiveCamera;
  lights: three.PointLight[];
  shape: three.Group | null;
  loader: OBJLoader;
  rotator: Rotator;

  constructor() {
    //set scene
    this.scene = new three.Scene();

    // set camera
    this.camera = new three.PerspectiveCamera(1, 1, 0.1, 500);

    //set renderer
    this.renderer = new three.WebGLRenderer({
      canvas: document.getElementById("background")!,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const renderWidth = IS_MOBILE ? window.innerWidth : window.innerWidth * 0.4;
    const renderHeight = IS_MOBILE ? 200 : window.innerHeight;

    this.renderer.setSize(renderWidth, renderHeight);
    this.renderer.setClearColor(0xeeeeee);

    //set shape
    this.shape = null;

    //set rotator
    this.rotator = new Rotator();

    //set lights array
    this.lights = [];

    this.loader = new OBJLoader();
  }

  public addPointLight(
    color: number,
    xPos: number,
    yPos: number,
    zPos: number,
    power: number
  ) {
    const light = new three.PointLight(color);
    light.position.set(xPos, yPos, zPos);
    light.power = power;

    this.lights.push(light);
    this.scene.add(light);

    return this;
  }

  public addAmbientLight(color: number, intencity: number) {
    const light = new three.AmbientLight(color, intencity);
    this.scene.add(light);
    return this;
  }

  public loadModel(onLoad?: () => void) {
    this.loader.load(
      "/model_2.obj",
      (object) => {
        object.scale.x = 0.1;
        object.scale.y = 0.1;
        object.scale.z = 0.1;

        object.rotateY(3);

        object.children.forEach((mesh) => {
          if (mesh instanceof three.Mesh) {
            mesh.material = new three.MeshBasicMaterial({
              color: 0x111111,
              // metalness: 5,
              wireframe: true,
            });
          }
        });

        this.scene.add(object);
        this.shape = object;

        const sound = new Audio("soundtrack.mp3");
        sound.volume = 0.1;
        sound.play();

        if (onLoad) onLoad();
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    return this;
  }

  public addListeners() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    document.addEventListener("mousemove", (event) => {
      const xMod = Math.floor(((event.clientX - centerX) * 100) / centerX);
      const yMod = Math.floor(((event.clientY - centerY) * 100) / centerY);

      this.rotator.setX(xMod);
      this.rotator.setY(yMod);
    });

    document.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];

      const xMod = Math.floor(((touch.clientX - centerX) * 100) / centerX);
      const yMod = Math.floor(((touch.clientY - centerY) * 100) / centerY);

      this.rotator.setX(xMod);
      this.rotator.setY(yMod);
    });

    return this;
  }

  public moveCamera(xPos: number, yPos: number, zPos: number) {
    this.camera.position.set(xPos, yPos, zPos);
    return this;
  }

  public render() {
    const animation = () => {
      this.renderer.render(this.scene, this.camera);

      if (this.shape) {
        this.shape.rotateX(this.rotator.y / 200000);
        this.shape.rotateY(this.rotator.x / 200000);
        this.shape.rotateZ(0.0003);
      }
    };

    this.renderer.setAnimationLoop(animation);

    return this;
  }
}

const engine = new Engine()
  .moveCamera(0, 0, 100)
  .loadModel(showContent)
  .addListeners();

engine.render();
