import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProblemList />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;