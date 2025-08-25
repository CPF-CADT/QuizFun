export const ratelimitConfig= {
    global: { windowMs: 15*60*1000, max: 100,message: "Too many requests, please try again later." },
    quiz: { windowMs: 15*60*1000, max: 15,message: "Too many requests, please try again later." },
    createQuizz:{windowMs: 15*60*1000, max: 15,message: "Too many requests, please try again later."},
    lobbyQuizz:{windowMs: 15*60*1000, max: 15,message: "Too many requests, please try again later."},
    
}   