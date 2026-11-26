import {Reveal} from "./Reveal";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight,ArrowUpRight} from "lucide-react";
import {QuoteButton} from "@/components/forms/QuoteModal";
import {type Service} from "@/data/site";
export function Photo({id,alt,hero=false}:{id:string;alt:string;hero?:boolean}){return <Image fill preload={hero} sizes={hero?"100vw":"(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 38vw"} src={'/images/'+id+'.webp'} alt={alt}/>}
export function SectionHeading({label,title}:{label:string;title:string}){return <Reveal><small>{label}</small><h2>{title}</h2></Reveal>}
export function ServiceCard({s}:{s:Service}){return <Link className="service-card" href={'/services#'+s.id}><div className="photo"><Photo id={s.id} alt={s.short+' illustration'}/></div><div className="row"><h3>{s.short}</h3><ArrowUpRight size={21}/></div><p>{s.desc}</p></Link>}
export function CTASection({assist=false}:{assist?:boolean}){return <section className="cta"><div className="container split"><div><small>START A CONVERSATION</small><h2>{assist?"Not sure which printing method is right for you?":"Have a printing requirement?"}</h2><p>Tell us about your artwork, material and quantity. Let’s find the right printing solution for your requirements.</p></div><div className="buttons"><QuoteButton>Request a Custom Quote</QuoteButton><Link href="/#contact">Contact Us <ArrowRight size={17}/></Link></div></div></section>}