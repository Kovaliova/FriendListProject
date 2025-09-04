import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  test('не рендерится если всего 1 страница', () => {
    const { container } = render(
      <Pagination page={1} total={4} limit={10} onPage={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('корректный рендер страниц и стрелок', () => {
    render(<Pagination page={3} total={50} limit={4} onPage={() => {}} />);

    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('active');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();

    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  test('клики по стрелкам вызывают onPage', () => {
    const onPage = jest.fn();
    render(<Pagination page={3} total={50} limit={4} onPage={onPage} />);

    fireEvent.click(screen.getByText('←'));
    expect(onPage).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByText('→'));
    expect(onPage).toHaveBeenCalledWith(4);
  });

  test('кнопки стрелок дизейбл на краях', () => {
  const { rerender } = render(<Pagination page={1} total={50} limit={4} onPage={() => {}} />);
  expect(screen.getByText('←')).toBeDisabled();
  expect(screen.getByText('→')).not.toBeDisabled();

  rerender(<Pagination page={13} total={50} limit={4} onPage={() => {}} />);
  expect(screen.getByText('→')).toBeDisabled();
  expect(screen.getByText('←')).not.toBeDisabled();
 });

  test('клик по номеру страницы вызывает onPage', () => {
    const onPage = jest.fn();
    render(<Pagination page={1} total={50} limit={4} onPage={onPage} />);

    fireEvent.click(screen.getByText('3'));
    expect(onPage).toHaveBeenCalledWith(3);
  });
});