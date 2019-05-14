// MIT License

// Copyright (c) 2018 Neutralinojs

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const AdventureChoices = ({scene, update}) => {
    return React.createElement('ul', null, ...scene.options.map((o,i) => React.createElement('li', {key:i, onClick:() => update(o.link)}, o.text)));
}

class VideoDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.vidRef = React.createRef();
    }

    readyVideo = () => {
        this.vidRef.current.muted = false;
    }

    render() {
        const {videoUrl, onEnd, fade} = this.props;
        setTimeout(() => this.readyVideo(), 50);
        return (
            <video style={{opacity: (fade ? 0 : 1)}} ref={this.vidRef} key={videoUrl} onEnded={onEnd} controls="controls" autoplay="autoplay" muted="muted">
               <source src={videoUrl} type="video/mp4" />
            </video>
        );
    }
}

class Quitter extends React.Component {
    render() {
        const {quit} = this.props;
        return (
            <div class="quit" onClick={quit}>QUIT</div>
        )
    }
}

class FadeIn extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
       const {children, show} = this.props;
       return (
           <span class={`fader ${show ? ' on' : ''}`}>{...children}</span>
       );
    }
}

class Finish extends React.Component {
    render() {
        const {finish} = this.props;
        return (
            <ul><li onClick={() => finish()}>THE END...</li></ul>
        );
    }
}

class Credits extends React.Component {
    constructor(props) {
        super(props);
        this.creditRef = React.createRef();
    }
    
    scrollCredits = (time) => {
        const height = this.creditRef.current.clientHeight;
        this.creditRef.current.style.top = (0 - height) + 'px';
        setTimeout(() => this.props.onEnd(), time * 1000);
    }
    
    render() {
        const {credits} = this.props;
        const offset = window.innerHeight;
        const time = Math.ceil(credits.length / 4) * 10;
        setTimeout(() => this.scrollCredits(time), 100);
        return (
             <div class="credits" ref={this.creditRef} style={{top: offset, transition: `all ${time}s`}}>
                 {credits.map(c => <div class="credit"><h3>{c.role}</h3><p>{c.name}</p></div>)}
             </div>
        );
    }
}

class Adventure extends React.Component {

  state = {scene: "1", show: false, showCredits: false}

  updateScene = scene => {
      this.setState({show: false});
      setTimeout(() => this.setState({scene}), 500);
  }

  showChoice = () => this.setState({show: true});
  complete = () => this.setState({show: false, showCredits: true});

  render() {
     const {scenes, quit, credits} = this.props;
     const scene = scenes.find(s=> s.id === this.state.scene);
     const {show, showCredits} = this.state;
     return (
         <div class="adventure-screen">
             <VideoDisplay fade={showCredits} videoUrl={scene.video} onEnd={this.showChoice} />
             <Quitter quit={quit} />
             <FadeIn show={show}>{scene.end ? <Finish finish={this.complete} /> : <AdventureChoices scene={scene} update={this.updateScene} />}</FadeIn>
             {showCredits && <Credits credits={credits} onEnd={quit} />}
         </div>
     );
  }

}

class TitleScreen extends React.Component {

  render() {
     const {title, starter} = this.props;
     return (
        <div class="title-screen">
          <h1>{title}</h1>
          <h2 onClick={starter}>Start</h2>
        </div>
     )
  }

}

class App extends React.Component {

  componentDidMount() {
      const ADVENTURE = require('./adventure.json');
      this.setState({title: ADVENTURE.title, scenes: ADVENTURE.scenes, credits: ADVENTURE.credits});
  } 

  state = {
      title: null,
      scenes: null,
      playing: false
  }

  startAdventure = () => {
      this.setState({playing:true});
  }

  stopAdventure = () => {
      this.setState({playing: false});
  }

  render() {
      const {title, scenes, playing, credits} = this.state;
      return (
          <div class="game-container">
              {playing ? <Adventure scenes={scenes} quit={this.stopAdventure} credits={credits} /> : <TitleScreen title={title} starter={() => this.startAdventure()} />}
          </div>
      );
  }

}

(function() {
    const rootElement = document.getElementById("cyoa-app");
    ReactDOM.render(React.createElement(App), rootElement);
}());

