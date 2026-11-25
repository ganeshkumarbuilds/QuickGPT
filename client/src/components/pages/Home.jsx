import { useState } from 'react'
import { Link } from 'react-router-dom'
import Brand from '../Brand'
import lunar from '../../assets/ai_image9.jpg'
import forest from '../../assets/ai_image2.jpg'
import city from '../../assets/ai_image5.jpg'

const studies = [
  [
    'Lunar drive',
    lunar,
    'A vintage car on the moon, photographed in black and white.',
  ],
  [
    'Forest light',
    forest,
    'A sunlit jungle clearing filled with prehistoric life.',
  ],
  ['Neon city', city, 'A futuristic skyline washed in cyan and neon pink.'],
]
export default function Home() {
  const [index, setIndex] = useState(0)
  const [title, image, prompt] = studies[index]
  return (
    <div className="public-page">
      <header className="mast">
        <Brand />
        <nav>
          <a href="#features">Features</a>
          <Link to="/login">Log in</Link>
          <Link className="button ink" to="/signup">
            Get started ↗
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">
              <i /> AI creative workspace
            </p>
            <h1>
              Make room
              <br />
              for <em>ideas.</em>
            </h1>
            <p className="intro">
              Think through a question, draft something new, or turn a few words
              into an image. All in one workspace.
            </p>
            <Link className="button orange" to="/signup">
              Create your account <span>↗</span>
            </Link>
            <p className="fine">20 credits included when you sign up</p>
          </div>
          <figure className="study">
            <div className="photo">
              <img key={image} src={image} alt={prompt} />
              <span className="photo-label">Image studio</span>
            </div>
            <figcaption>
              <div>
                <small>Prompt study</small>
                <strong>{title}</strong>
              </div>
              <div className="art-controls">
                <button
                  aria-label="Previous image"
                  onClick={() => setIndex((index + 2) % 3)}
                >
                  ←
                </button>
                <button
                  aria-label="Next image"
                  onClick={() => setIndex((index + 1) % 3)}
                >
                  →
                </button>
              </div>
            </figcaption>
          </figure>
        </section>
        <section className="features" id="features">
          <h2>Inside the workspace</h2>
          <div className="feature-grid">
            {[
              [
                '↳',
                'Conversation',
                'Ask a question, refine a draft, and pick up where you left off with saved chat history.',
              ],
              [
                '✳',
                'Image studio',
                'Describe a scene and generate an image alongside your conversation.',
              ],
              [
                '▧',
                'Community gallery',
                'Explore published images and choose which of your own creations to share.',
              ],
            ].map(([icon, name, body]) => (
              <article key={name}>
                <span aria-hidden="true">{icon}</span>
                <h3>{name}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <Brand />
        <Link to="/login">Log in to your workspace ↗</Link>
      </footer>
    </div>
  )
}
