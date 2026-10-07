export type Roast = "Light" | "Medium" | "Dark";
export type Coffee = { slug:string; name:string; origin:string; region:string; roast:Roast; notes:string[]; price:number; color:string; description:string; profile:Record<"acidity"|"body"|"sweetness"|"bitterness"|"aroma"|"finish", number>; brew:string; };
export type BagItem = { slug:string; size:"250g"|"1kg"; quantity:number };
export type ArticleBlock = { type:"paragraph"|"heading"|"quote"|"list"; content:string|string[] };
export type JournalArticle = { slug:string; title:string; dek:string; minutes:number; blocks:ArticleBlock[] };
