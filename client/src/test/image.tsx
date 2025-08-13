import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ImageUploader from '../components/imageUploader';
import { useImageUpload} from '../hook/useImageUpload';
import type { MockedFunction } from 'vitest';

// Mock the custom hook
vi.mock('../hook/useImageUpload');


// Create a mock file
const mockFile = new File(['hello'], 'hello.png', { type: 'image/png' });

// Create a URL for the mock file to be used in the image preview
globalThis.URL.createObjectURL = vi.fn(() => 'mock-preview-url');

describe('ImageUploader', () => {
  const mockUseImageUpload = useImageUpload as MockedFunction<typeof useImageUpload>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  test('renders the initial state correctly', () => {
    mockUseImageUpload.mockReturnValue({
      isUploading: false,
      uploadedImageUrl: '',
      selectedFile: null,
      fileInputRef: { current: null },
      handleSelectFileClick: vi.fn(),
      handleFileSelect: vi.fn(),
      handleUpload: vi.fn(),
    });

    render(<ImageUploader />);

    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.getByText('Select Image')).toBeInTheDocument();
    expect(screen.queryByText('Upload Now')).not.toBeInTheDocument();
  });

  test('displays an image preview when a file is selected', () => {
    mockUseImageUpload.mockReturnValue({
      isUploading: false,
      uploadedImageUrl: '',
      selectedFile: mockFile,
      fileInputRef: { current: null },
      handleSelectFileClick: vi.fn(),
      handleFileSelect: vi.fn(),
      handleUpload: vi.fn(),
    });

    render(<ImageUploader />);

    const imagePreview = screen.getByRole('img');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', 'mock-preview-url');
  });

  test('displays the uploaded image URL when available', () => {
    mockUseImageUpload.mockReturnValue({
      isUploading: false,
      uploadedImageUrl: 'http://example.com/uploaded-image.png',
      selectedFile: null,
      fileInputRef: { current: null },
      handleSelectFileClick: vi.fn(),
      handleFileSelect: vi.fn(),
      handleUpload: vi.fn(),
    });

    render(<ImageUploader />);

    const imagePreview = screen.getByRole('img');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', 'http://example.com/uploaded-image.png');
  });

  test('calls handleSelectFileClick when "Select Image" is clicked', async () => {
    const handleSelectFileClick = vi.fn();
    mockUseImageUpload.mockReturnValue({
      isUploading: false,
      uploadedImageUrl: '',
      selectedFile: null,
      fileInputRef: { current: null },
      handleSelectFileClick: handleSelectFileClick,
      handleFileSelect: vi.fn(),
      handleUpload: vi.fn(),
    });

    render(<ImageUploader />);
    await userEvent.click(screen.getByText('Select Image'));
    expect(handleSelectFileClick).toHaveBeenCalledTimes(1);
  });

  test('shows "Upload Now" button when a file is selected', () => {
    mockUseImageUpload.mockReturnValue({
      isUploading: false,
      uploadedImageUrl: '',
      selectedFile: mockFile,
      fileInputRef: { current: null },
      handleSelectFileClick: vi.fn(),
      handleFileSelect: vi.fn(),
      handleUpload: vi.fn(),
    });

    render(<ImageUploader />);
    expect(screen.getByText('Upload Now')).toBeInTheDocument();
  });

  test('calls handleUpload when "Upload Now" is clicked', async () => {
    const handleUpload = vi.fn();
    mockUseImageUpload.mockReturnValue({
      isUploading: false,
      uploadedImageUrl: '',
      selectedFile: mockFile,
      fileInputRef: { current: null },
      handleSelectFileClick: vi.fn(),
      handleFileSelect: vi.fn(),
      handleUpload: handleUpload,
    });

    render(<ImageUploader />);
    await userEvent.click(screen.getByText('Upload Now'));
    expect(handleUpload).toHaveBeenCalledTimes(1);
  });

  test('displays "Uploading..." and disables buttons when uploading', () => {
    mockUseImageUpload.mockReturnValue({
      isUploading: true,
      uploadedImageUrl: '',
      selectedFile: mockFile,
      fileInputRef: { current: null },
      handleSelectFileClick: vi.fn(),
      handleFileSelect: vi.fn(),
      handleUpload: vi.fn(),
    });

    render(<ImageUploader />);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('Select Image')).toBeDisabled();
    expect(screen.getByText('Uploading...')).toBeDisabled();
  });
});