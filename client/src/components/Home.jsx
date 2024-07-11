import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../App.css";
import axios from 'axios'

const Header = () => {
  const navigate =useNavigate();
  axios.defaults.withCredentials=true;
  const handleLogout=()=>{
    axios.get('http://localhost:3000/auth/logout').then(res=>{
      if(res.data.status){
        navigate('/login')
      }
    }).catch(err=>{
      console.log(err)
    })
  }
  return (
    <header>
      <nav>
        <ul>
          <li><button><Link to="/dashboard">Dashboard</Link></button></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer>
      <p>&copy; 2023 My App</p>
    </footer>
  );
};

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <div>
          {/* Home */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;