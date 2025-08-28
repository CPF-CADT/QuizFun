export const ratelimitConfig= {
    global: { windowMs: 15*60*1000, max: 200,message: "Too many requests, please try again later." },
    quiz: { windowMs: 15*60*1000, max: 150,message: "Too many requests, please try again later." },
    
    
}   