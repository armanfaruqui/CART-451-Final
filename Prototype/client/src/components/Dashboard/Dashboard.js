// Packages
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';

// Audio
import channelSwitch from './audio/channel-switch.mp3';
import tvOff from './audio/tvoff.mp3';

//Images
import rickTv from './images/Rick-morty-tv.png';
import staticGif from './images/static.gif';

// Video
import rickTvVideo from './video/rick-tv.webm';

// JS
import GetVideo from './get-video.js'

import './Dashboard.css';
import Navbar from '../Navbar/Navbar';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    let shouldRedirect = false;
    if (localStorage.getItem('userTokenTime')) {
      // Check if user holds token which is valid in accordance to time
      const data = JSON.parse(localStorage.getItem('userTokenTime'));
      if (new Date().getTime() - data.time > (1 * 60 * 60 * 1000)) {
        // It's been more than hour since you have visited dashboard
        localStorage.removeItem('userTokenTime');
        shouldRedirect = true;
      }
    } else {
      shouldRedirect = true;
    }

    this.state = {
      redirect: shouldRedirect,
      videoList: []
    }
  }


  render() {
    if (this.state.redirect) return <Redirect to="/signIn" />
    const p = new GetVideo();
    p.getVideo()
    console.log(p.onButton)
    
    return (
      <React.Fragment>
        <Navbar />
        <div id="body" className="tv-off">
    <div className="remote-area">
        <div className="tips">
            <ul>
                <li><b>Power Button</b>: Turns TV On/Off(O,P)</li>
                <li><b>Zoom</b>: Zooms the TV in or out for a better view(Z)</li>
                <li><b>MENU</b>: Shows the TV menu which gives you a list of previously played shows and info about the site(M)</li>
                <li><b>MUTE</b>: Mutes the TV's audio(S)</li>
                <li><b>CH +</b>: Changes the channel(N,J,C,right)</li>
                <li><b>VOL +/-</b>: Adjusts the TV's volume(+/-)</li>
                <li><b>OK</b>: Opens the current video's Reddit thread in a new tab(R)</li>
                <li><b>NO SIGNAL</b>: Reddit's API is down. Turn your TV On and Off again to see if the signal is back</li>
            </ul>
        </div>
        <div className="remote">
            <div className="top-row">
                <span className="button red" id="power" onClick={p.onButton}>Pwr</span>
                <span className="button" id="zoom">Zoom</span>
            </div>
            <div className="matrix">
                <span className="button">1</span>
                <span className="button">2</span>
                <span className="button">3</span>
                <span className="button">4</span>
                <span className="button">5</span>
                <span className="button">6</span>
                <span className="button">7</span>
                <span className="button">8</span>
                <span className="button">9</span>
                <span className="button" id="menu">Menu</span>
                <span className="button">0</span>
                <span className="button" id="mute">Mute</span>
            </div>
            <div className="bottom">
                <span className="button wide" id="channel-up">CH +</span>
                <span className="button large" id="volume-down"><span>VOL<br/>-</span></span>
                <a href="#" className="button center red" id="video-url" target="_blank">OK</a>
                <span className="button large" id="volume-up"><span>VOL<br/>+</span></span>
                <span className="button wide"></span>
            </div>
        </div>
    </div>

        <div className="container">
        <img src={rickTv} alt="Rick and Morty TV Background" className="rick-bg"/>
        <video src={rickTvVideo} className="rick-bg" id="rick-bg"> </video>
        <audio src={tvOff} id="off-audio"></audio>
        <audio src={channelSwitch} id="switch-audio"></audio>
        <div id="video">
            <div className="cover animated"></div>
            <div className="cover"></div>
            <div id="yt-contain" className="channel show" data-channel-id="??">
                <div className="cover static"></div>
                <div className="volume" data-volume="60"></div>
                <div id="yt-iframe"></div>
            </div>
            <div className="tv-menu">
                <div className="contents">
                    <div className="right">
                        <h2>Menu</h2>
                        <p><i>A non-stop stream of intergalactic content straight to your eyeholes!</i></p>
                        <h3>Select your sources</h3>
                        <p id="IDC" checked = {true}>/r/InterdimensionalCable (default) </p> <br/>
                        <p id="NTE">/r/NotTimAndEric</p><br/>
                        <p id="ACI">/r/ACIDS</p><br/>
                        <p id="FWV">/r/fifthworldvideos</p><br/>
                        <p id="IBG">/r/IllBeYourGuide</p><br/>
                        <p id="CMC">/r/CommercialCuts</p> 
                        <h3>Minimum score</h3>
                        <input type="range" min="0" max="1000" defaultValue="1" className="slider" id="min_score"/><span id="score_preview">1</span>
                        <h3>Past Shows</h3>
                        <div id="list-template">
                            <li>
                                <a href="">
                                    <div>
                                        <div className="poster">
                                            <div></div>
                                        </div>
                                        <div className="video-info">
                                            <span className="video-title"></span>
                                            <span className="video-author"></span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </div>
                        <ul className="shows">
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
      </React.Fragment>
    );
    
  }
  
}

export default Dashboard;