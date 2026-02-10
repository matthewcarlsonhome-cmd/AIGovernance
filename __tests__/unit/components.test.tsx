import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

describe('UI Components', () => {
  describe('Button', () => {
    it('should render with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is passed', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });

    it('should forward className', () => {
      render(<Button className="custom-class">Styled</Button>);
      const btn = screen.getByRole('button', { name: 'Styled' });
      expect(btn.className).toContain('custom-class');
    });

    it('should render with type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit');
    });
  });

  describe('Badge', () => {
    it('should render with text content', () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should forward className', () => {
      render(<Badge className="test-badge">Tag</Badge>);
      const badge = screen.getByText('Tag');
      expect(badge.className).toContain('test-badge');
    });
  });

  describe('Card', () => {
    it('should render Card component', () => {
      render(<Card data-testid="card">Card content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render CardHeader', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render CardTitle', () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should render CardDescription', () => {
      render(<CardDescription>My description</CardDescription>);
      expect(screen.getByText('My description')).toBeInTheDocument();
    });

    it('should render CardContent', () => {
      render(<CardContent data-testid="content">Body</CardContent>);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should render CardFooter', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render a complete card with all subcomponents', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content body</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>,
      );
      expect(screen.getByTestId('full-card')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content body')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('should render an input element', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should accept type prop', () => {
      render(<Input type="email" data-testid="email-input" />);
      expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');
    });

    it('should accept placeholder prop', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is passed', () => {
      render(<Input disabled data-testid="disabled-input" />);
      expect(screen.getByTestId('disabled-input')).toBeDisabled();
    });
  });

  describe('Label', () => {
    it('should render a label element', () => {
      render(<Label>Username</Label>);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should associate with input via htmlFor', () => {
      render(
        <>
          <Label htmlFor="test-input">Email</Label>
          <Input id="test-input" />
        </>,
      );
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'test-input');
    });
  });

  describe('Progress', () => {
    it('should render with progressbar role', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should set aria-valuenow to value', () => {
      render(<Progress value={75} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should set aria-valuemax to max', () => {
      render(<Progress value={50} max={200} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '200');
    });

    it('should set aria-valuemin to 0', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should default value to 0 when not provided', () => {
      render(<Progress />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('Separator', () => {
    it('should render a separator element', () => {
      render(<Separator data-testid="sep" />);
      expect(screen.getByTestId('sep')).toBeInTheDocument();
    });

    it('should have role=none when decorative (default)', () => {
      render(<Separator data-testid="sep-dec" />);
      expect(screen.getByTestId('sep-dec')).toHaveAttribute('role', 'none');
    });

    it('should have role=separator when non-decorative', () => {
      render(<Separator decorative={false} data-testid="sep-func" />);
      expect(screen.getByTestId('sep-func')).toHaveAttribute('role', 'separator');
    });

    it('should accept custom className', () => {
      render(<Separator className="my-sep" data-testid="sep-class" />);
      expect(screen.getByTestId('sep-class').className).toContain('my-sep');
    });
  });
});
