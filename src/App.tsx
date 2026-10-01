export interface AppProps {
  title?: string;
}

export function App({ title = 'pos-test-cicd-frontend' }: AppProps) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  );
}