import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.world')


// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)



const sizes = {
    width: window.innerWidth * 0.45,
    // height: window.innerHeight * 0.65
    height: 10
}




window.addEventListener('resize', () => {
    
    // Update sizes
    sizes.width = window.innerWidth * 0.9
    sizes.height = window.innerHeight * 0.65
    // Update camera 
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
})





const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)


const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true



const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const clock = new THREE.Clock()


const animation = () => {
    renderer.setSize(sizes.width, sizes.height)
    
    if (sizes.height < window.innerHeight * 0.65){
        sizes.height = sizes.height += 3.5
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

    } 
    else if (sizes.width < window.innerWidth * 0.9){
        sizes.width = sizes.width += 5
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    }


    const elapsedTime = clock.getElapsedTime()
    


    controls.update()

    // Render
    renderer.render(scene, camera)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    requestAnimationFrame(animation)


}
animation()


console.log(THREE)