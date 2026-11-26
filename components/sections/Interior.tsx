import Link from "next/link";
import {Photo} from "@/components/ui/Editorial";
import {QuoteButton} from "@/components/forms/QuoteModal";
import type {Service} from "@/data/site";
export function InteriorHero({page,title,desc,image}:{page:string;title:string;desc:string;image:string}){return <section className="interior"><div className="container two"><div><small><Link href="/">HOME</Link> / {page.toUpperCase()}</small><h1>{title}</h1><p>{desc}</p></div><div className="photo"><Photo id={image} alt={'Illustrative '+page.toLowerCase()+' textile detail'} hero/></div></div></section>}
export function ServiceDetail({s}:{s:Service}){return <article id={s.id} className="detail"><div className="photo"><Photo id={s.id} alt={s.finish}/></div><div><small>{s.finish}</small><h3>{s.name}</h3><p>{s.desc}</p><p><b>Typical applications</b><br/>{s.use}</p><QuoteButton className="textlink" service={s.id}/></div></article>}