//--- iron world
// by Catzpaw 2018
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define OCT 9
#define ITER 60
#define EPS 0.0015
#define NEAR .0
#define FAR 20.

vec3 rotX(vec3 p,float a){return vec3(p.x,p.y*cos(a)-p.z*sin(a),p.y*sin(a)+p.z*cos(a));}
vec3 rotY(vec3 p,float a){return vec3(p.x*cos(a)-p.z*sin(a),p.y,p.x*sin(a)+p.z*cos(a));}
vec3 rotZ(vec3 p,float a){return vec3(p.x*cos(a)-p.y*sin(a), p.x*sin(a)+p.y*cos(a), p.z);}
vec3 hsv(float h,float s,float v){return ((clamp(abs(fract(h+vec3(0.,.666,.333))*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;}

float map(vec3 p){float r=1.;p=rotX(p,time*.15);p=rotZ(p,time*.111);p=(fract(p)-.5)*1.6;
	for(int i=0;i<OCT;i++){p=abs(p);float s=2./clamp(dot(p,p),.53,1.);p*=s;p-=vec3(.8);r*=s;}
	return length(p/r);}

float trace(vec3 ro,vec3 rd,out float n){float t=NEAR,d;
	for(int i=0;i<ITER;i++){d=map(ro+rd*t);if(abs(d)<EPS||t>FAR)break;t+=step(d,1.)*d*.2+d*.5;n+=1.;}
	return min(t,FAR);}

void main(void){
	vec2 uv=(gl_FragCoord.xy-.5*resolution.xy)/resolution.y;
	vec3 rd=vec3(uv,-.5);
	float n=0.,v=1.-trace(vec3(.5),rd,n)/FAR;n/=float(ITER);
	gl_FragColor=vec4(mix(hsv(v,n,1.),vec3(1.),n)*n,1);
}
