uniform float uTime;
uniform float uPixelRatio;
uniform float uPointSize;

attribute float aScale;


void main(){
  vec3 newPosition = position;
  newPosition.y += sin(uTime + newPosition.x) * aScale *0.2;
  vec4 modelPosition =modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
  
  gl_PointSize = uPointSize * aScale * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);

}  