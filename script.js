// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const videoPreview = document.getElementById('videoPreview');
const previewVideo = document.getElementById('previewVideo');
const videoTitle = document.getElementById('videoTitle');
const videoDuration = document.getElementById('videoDuration');
const videoQuality = document.getElementById('videoQuality');
const downloadVideoBtn = document.getElementById('downloadVideoBtn');

// API Configuration
const API_BASE_URL = 'https://laurine.site/api/downloader/fbdownload';

// Current video data
let currentVideoData = null;

// Event Listeners
downloadBtn.addEventListener('click', handleDownload);
downloadVideoBtn.addEventListener('click', handleVideoDownload);
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleDownload();
    }
});

// Clear error and preview when input changes
videoUrlInput.addEventListener('input', () => {
    hideError();
    hidePreview();
});

/**
 * Handle the download button click
 */
async function handleDownload() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showError('Please enter a Facebook video URL');
        return;
    }
    
    if (!isValidFacebookUrl(url)) {
        showError('Please enter a valid Facebook video URL');
        return;
    }
    
    try {
        showLoading();
        hideError();
        hidePreview();
        
        const videoData = await fetchVideoData(url);
        
        if (videoData && videoData.success) {
            currentVideoData = videoData;
            showVideoPreview(videoData);
        } else {
            throw new Error(videoData?.message || 'Failed to process video');
        }
        
    } catch (error) {
        console.error('Download error:', error);
        showError(error.message || 'Failed to download video. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Fetch video data from the API
 */
async function fetchVideoData(url) {
    try {
        const response = await fetch(`${API_BASE_URL}?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('API Error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        }
        
        throw new Error('Failed to connect to the download service. Please try again later.');
    }
}

/**
 * Validate Facebook URL
 */
function isValidFacebookUrl(url) {
    const fbUrlPatterns = [
        /^https?:\/\/(www\.)?facebook\.com\/.*\/videos?\/.*/,
        /^https?:\/\/(www\.)?facebook\.com\/watch\?.*/,
        /^https?:\/\/(www\.)?facebook\.com\/.*\/posts\/.*/,
        /^https?:\/\/fb\.watch\/.*/,
        /^https?:\/\/(www\.)?facebook\.com\/reel\/.*/
    ];
    
    return fbUrlPatterns.some(pattern => pattern.test(url));
}

/**
 * Show video preview
 */
function showVideoPreview(videoData) {
    try {
        // Extract video information
        const title = videoData.title || 'Facebook Video';
        const videoUrl = videoData.video_url || videoData.url || videoData.download_url;
        const thumbnail = videoData.thumbnail || '';
        const duration = videoData.duration || '--:--';
        const quality = videoData.quality || 'HD';
        
        // Update preview elements
        videoTitle.textContent = title;
        videoDuration.textContent = `Duration: ${duration}`;
        videoQuality.textContent = `Quality: ${quality}`;
        
        // Set video source
        if (videoUrl) {
            previewVideo.src = videoUrl;
            if (thumbnail) {
                previewVideo.poster = thumbnail;
            }
        }
        
        // Show preview section
        videoPreview.classList.remove('hidden');
        
        // Scroll to preview
        videoPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } catch (error) {
        console.error('Preview error:', error);
        showError('Video processed successfully, but preview failed to load.');
    }
}

/**
 * Handle video download
 */
function handleVideoDownload() {
    if (!currentVideoData) {
        showError('No video data available for download');
        return;
    }
    
    try {
        const downloadUrl = currentVideoData.video_url || currentVideoData.url || currentVideoData.download_url;
        const filename = `BSave_${Date.now()}.mp4`;
        
        if (!downloadUrl) {
            throw new Error('Download URL not available');
        }
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = filename;
        downloadLink.target = '_blank';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Show success message
        showSuccessMessage('Download started! Check your downloads folder.');
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download video. Please try again.');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
}

/**
 * Show error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(hideError, 5000);
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Hide video preview
 */
function hidePreview() {
    videoPreview.classList.add('hidden');
    currentVideoData = null;
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add success message styles
    successDiv.style.cssText = `
        background: rgba(46, 204, 113, 0.1);
        border: 1px solid rgba(46, 204, 113, 0.3);
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        color: #2ecc71;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 20px auto;
        max-width: 600px;
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

/**
 * Format duration from seconds to MM:SS
 */
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Initialize the application
 */
function init() {
    // Focus on input field when page loads
    videoUrlInput.focus();
    
    // Add placeholder animation
    let placeholderIndex = 0;
    const placeholders = [
        'Paste Facebook video URL...',
        'Example: facebook.com/watch?v=...',
        'Example: fb.watch/...',
        'Paste Facebook video URL...'
    ];
    
    setInterval(() => {
        videoUrlInput.placeholder = placeholders[placeholderIndex];
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle paste events
videoUrlInput.addEventListener('paste', (e) => {
    // Small delay to allow paste content to be processed
    setTimeout(() => {
        const url = videoUrlInput.value.trim();
        if (url && isValidFacebookUrl(url)) {
            // Auto-hide any existing errors when valid URL is pasted
            hideError();
        }
    }, 100);
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to download
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleDownload();
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        videoUrlInput.value = '';
        hideError();
        hidePreview();
        videoUrlInput.focus();
    }
});
