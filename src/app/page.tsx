import Button from '../components/Button';
import Card from '../components/Card';
import { ApiStatus } from '@/components/ApiStatus';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-8">
      <main className="max-w-5xl mx-auto">
        <header className="flex flex-col items-center py-12 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explora.AI</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Your personal AI learning guide - explore concepts, highlight text, and create custom
            learning paths
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card title="Chat with AI">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start a conversation with our AI assistant to learn about any topic or concept.
            </p>
            <Link href="/chat">
              <Button>Start Learning</Button>
            </Link>
          </Card>

          <Card title="Learning Path">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a personalized learning path by pinning important messages and concepts.
            </p>
            <Button variant="secondary">Create Path</Button>
          </Card>

          <Card title="Text Highlighting">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Highlight text to branch into specific topics and explore related concepts.
            </p>
            <Button variant="outline">Try Highlighting</Button>
          </Card>

          <Card title="Generate Guides">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Turn your conversations and saved insights into comprehensive learning guides.
            </p>
            <Button variant="secondary">Generate Guide</Button>
          </Card>
        </section>

        <section className="mb-16">
          <ApiStatus />
        </section>

        <footer className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Explora.AI
          </p>
          <div className="flex gap-4">
            <Link
              href="/chat"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Chat
            </Link>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Help
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
