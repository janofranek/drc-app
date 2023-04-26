/*
            <main >        
                <section>
                    <div>                                            
                        <p> DRCapp </p>                       
                                                       
                        <form>                                              
                            <div>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"                                    
                                    required                                                                                
                                    placeholder="Email address"
                                    onChange={(e)=>setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"                                    
                                    required                                                                                
                                    placeholder="Password"
                                    onChange={(e)=>setPassword(e.target.value)}
                                />
                            </div>
                                                
                            <div>
                                <button                                    
                                    onClick={onLogin}                                        
                                >      
                                    Login                                                                  
                                </button>
                            </div>                               
                        </form>
                       
                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <NavLink to="/signup">
                                Sign up
                            </NavLink>
                        </p>
                                                   
                    </div>
                </section>
            </main>


    <Router>
      <div>
        <section>                              
            <Routes>                                                                        
              <Route path="/" element={<Home/>}/>
              <Route path="/signup" element={<Signup/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/logout" element={<Logout/>}/>
            </Routes>                    
        </section>
      </div>
    </Router>


        <main className="form-signin">
        <form>
            
            <h1 className="h3 mb-3 fw-normal">DRCapp - Přihlášení</h1>

            <div className="form-floating">
            <input 
                type="email" 
                className="form-control" 
                id="email-address" 
                name="email"
                required
                placeholder="name@example.com"
                onChange={(e)=>setEmail(e.target.value)}/>
            <label htmlFor="email-address">Email</label>
            </div>
            <div className="form-floating">
            <input 
                type="password" 
                className="form-control" 
                id="password"
                name="password"
                required                                                                                
                placeholder="Heslo"
                onChange={(e)=>setPassword(e.target.value)}
            />
            <label htmlFor="password">Heslo</label>
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={onLogin}>Přihlásit</button>
            
        </form>
        </main>




            */