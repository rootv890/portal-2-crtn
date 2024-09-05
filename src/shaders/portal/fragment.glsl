varying vec2 vUv;

uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
#include ../includes/simplexNoise3D.glsl


// simplexNoise3D(vec3 v) 

  
void main()
{

    // Displace the UV
    vec2 displacedUv = vUv + simplexNoise3D(vec3(vUv * 3.0,uTime*0.2));

    float strength =  simplexNoise3D(vec3(displacedUv * 5.0,uTime*0.5));

    // OuterGlow
    float outerGlow =distance(vUv,  vec2(0.5,0.5)) *5.0 -1.4 ;
    strength += outerGlow;
    strength = strength + step( -0.5, strength);
    
    // Clamp the value between 0.0 and 1.0
    strength = clamp(strength,0.0,1.0);

    vec3 color = mix(uColorStart,uColorEnd,strength);

    gl_FragColor = vec4(color, 1.0);
    
}