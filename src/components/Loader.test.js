import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from './Loader';
import '@testing-library/jest-dom';

describe('Loader', () => {
  test('рендерится корректно', () => {
        render(<Loader />);
            expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    });
});