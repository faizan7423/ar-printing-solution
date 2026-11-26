export const company = {
  name: "AR Printing Solution", location: "Bengaluru, India",
  address: "No. 8, 1st Cross, SGN Layout, Lalbagh Main Road, Opp. Passport Office, Bangalore – 560027",
  email: "arprint2003@gmail.com", phones: [["080-22216778","+918022216778"],["+91 99451 12589","+919945112589"],["+91 99011 33120","+919901133120"]],
  whatsapp: null as string | null,
  intro: "AR Printing Solution is a Bengaluru-based garment and textile printing business. We work with artwork, fabric and garment samples to select a suitable printing method for each requirement."
};
export const nav = [["Home","/"],["About Us","/about"],["Printing Services","/services"],["Applications","/#applications"],["Gallery","/#gallery"],["Contact","/#contact"]];
export const strengths = [
 ["In-house testing","Wash and rub testing"],["Sample development","Artwork to garment samples"],["Multiple techniques","Methods for different fabrics"],["Order-based delivery","Planned around your quantity"]
];
export const services = [
 {id:"offset",name:"Offset Heat Transfer Printing",short:"Offset Heat Transfers",desc:"Multicolour artwork is printed as a transfer, then fused onto fabric or finished garments.",use:"Fabric panels and ready garments",finish:"Heat-applied colour"},
 {id:"screen",name:"Screen Printing",short:"Screen Printing",desc:"Ink passes through a prepared screen directly onto the textile to build up the printed design.",use:"T-shirts and textile panels",finish:"Direct ink deposit"},
 {id:"sublimation",name:"Sublimation Printing",short:"Sublimation Printing",desc:"Heat brings dye into a receptive surface for colourful artwork on suitable materials.",use:"T-shirts, backpacks and footwear",finish:"Dye-based colour"},
 {id:"reflective",name:"Reflective Vinyl Heat Transfers",short:"Reflective Transfers",desc:"Shapes cut from reflective vinyl are heat-applied to the garment and catch directional light.",use:"Garments and fabric panels",finish:"Light-reflecting surface"},
 {id:"labels",name:"Yoke / Garment Label Printing",short:"Garment Labels",desc:"Printed label artwork brings garment identification into the yoke or neck area.",use:"Garment necklines and yokes",finish:"Fine lettering and symbols"},
 {id:"glow",name:"Glow-in-the-Dark Transfers",short:"Glow-in-the-Dark Transfers",desc:"A heat-applied transfer uses phosphorescent pigment for artwork that glows after exposure to light.",use:"Decorative garment motifs",finish:"Afterglow effect"},
 {id:"water",name:"Water-Based Printing",short:"Water-Based Printing",desc:"Water-based inks soak into suitable textiles for a soft printed surface.",use:"Compatible garment fabrics",finish:"Soft hand feel"},
 {id:"glitter",name:"High-Density / Glitter Printing",short:"Special Effect Printing",desc:"Explore surface detail through raised artwork or a glitter finish. Discuss the intended effect during sampling.",use:"Decorative artwork and accents",finish:"Relief or sparkle"}
];
export type Service = typeof services[number];
export const applications = [["tees","T-shirts"],["bags","Bags"],["caps","Caps"],["jackets","Jackets"],["fabrics","Textile fabrics"],["footwear","Footwear"]];
export const steps = [["Discuss requirements","Share your artwork, fabric, quantity and intended finish."],["Sample development & approval","Review a sample together before committing to production."],["Printing & production","Apply the selected print method to the agreed material."],["Quality check & delivery","Review the finish and plan dispatch around the order."]];