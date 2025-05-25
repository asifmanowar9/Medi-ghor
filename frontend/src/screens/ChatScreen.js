import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Image,
  Spinner,
  Alert,
  ProgressBar,
  Modal,
} from 'react-bootstrap';
import { FaPaperclip, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import Message from '../components/Message';
import { getChatDetails } from '../actions/chatActions';
import { addMessage } from '../actions/chatActions';
import { analyzeImage } from '../actions/chatActions';
import ReactMarkdown from 'react-markdown';
import './ChatScreen.css';
import { CHAT_DETAILS_SUCCESS } from '../constants/chatConstants';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [usedModel, setUsedModel] = useState(null);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [waitingForAIResponse, setWaitingForAIResponse] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: chatId } = useParams();

  // Get user info from state
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Get chat details from state
  const chatDetails = useSelector((state) => state.chatDetails);
  const { loading, error, chat = {} } = chatDetails;

  // Get chat message add status
  const chatMessageAdd = useSelector((state) => state.chatMessageAdd) || {};
  const { loading: loadingAddMessage = false } = chatMessageAdd;

  // Get image analysis status
  const chatImageAnalyze = useSelector((state) => state.chatImageAnalyze) || {};
  const {
    loading: loadingAnalysis = false,
    analysis = null,
    imageUrl = null,
  } = chatImageAnalyze;

  // Get AI response waiting state
  const aiResponseWaiting = useSelector((state) => state.aiResponseWaiting);

  // Analysis loaded state
  const [analysisLoaded, setAnalysisLoaded] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getChatDetails(chatId));
    }
  }, [dispatch, navigate, chatId, userInfo]);

  useEffect(() => {
    // Scroll to bottom when messages change or when initially loading
    if (messagesEndRef.current && !loading) {
      // Add a slight delay to ensure all content is rendered before scrolling
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 300);
    }
  }, [chat.messages, loading]);

  // Add a new useEffect to handle initial page load scroll
  useEffect(() => {
    // Force scroll to bottom on initial chat load
    if (!loading && chat.messages && chat.messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }
      }, 500);
    }
  }, [chat, loading]);

  // Reset analysis progress when uploadingImage changes to false
  useEffect(() => {
    if (!uploadingImage) {
      setTimeout(() => {
        setAnalysisProgress(0);
      }, 2000);
    }
  }, [uploadingImage]);

  // Update the waiting state when aiResponseWaiting changes
  useEffect(() => {
    setWaitingForAIResponse(aiResponseWaiting);
  }, [aiResponseWaiting]);

  // Submit message handler function
  const submitMessageHandler = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Create a temporary user message to display immediately
      const tempUserMessage = {
        _id: 'temp-' + Date.now(),
        sender: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      };

      // Add temporary message to chat locally for immediate display
      const updatedChat = {
        ...chat,
        messages: [...(chat.messages || []), tempUserMessage],
      };

      // Update the local chat state with this temp message
      dispatch({
        type: CHAT_DETAILS_SUCCESS,
        payload: updatedChat,
      });

      // Clear message input immediately
      setMessage('');

      // Scroll to bottom
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);

      // Now send to server and wait for response
      dispatch(addMessage(chatId, tempUserMessage.content));
    }
  };

  // Update the uploadFileHandler function

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        'Please upload a valid image file (JPEG, PNG, GIF, WEBP)'
      );
      return;
    }

    // Clear any previous errors and set initial progress
    setErrorMessage('');
    setAnalysisProgress(10);

    // Create a temporary object URL for immediate preview
    const localImageUrl = URL.createObjectURL(file);
    setPreviewImage(localImageUrl);
    setAnalysisProgress(25);

    // Upload and analyze
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    // Create a temporary image message (no text message)
    const tempUserMessage = {
      _id: 'temp-' + Date.now(),
      sender: 'user',
      content: '', // Empty content - just showing the image
      createdAt: new Date().toISOString(),
      imageUrl: localImageUrl,
    };

    // Update local chat state immediately with the image
    const updatedChat = {
      ...chat,
      messages: [...(chat.messages || []), tempUserMessage],
    };

    dispatch({
      type: CHAT_DETAILS_SUCCESS,
      payload: updatedChat,
    });

    // Scroll to bottom immediately
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);

    // Now send to server - using space character to pass validation
    dispatch(addMessage(chatId, ' ', true))
      .then(() => {
        setAnalysisProgress(40);
        // Now upload the image for analysis
        return dispatch(analyzeImage(formData, chatId));
      })
      .then((data) => {
        setAnalysisProgress(75);
        if (data && data.analysis) {
          setUsedModel(data.model || 'AI');
          setOcrConfidence(data.confidence || null);
          setAnalysisLoaded(true);
          setAnalysisProgress(100);

          setTimeout(() => {
            // Add AI's analysis response as a message with isAnalysis flag
            dispatch(addMessage(chatId, data.analysis, false, true)).then(
              () => {
                setPreviewImage(''); // Clear the preview image once analysis is added to chat
                setAnalysisLoaded(false);
                // Scroll to bottom after analysis is added
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }
            );
          }, 1500);

          return data;
        }
        throw new Error('No analysis data received');
      })
      .catch((err) => {
        console.error('Error in image analysis flow:', err);

        // Check if it's a rate limit error
        const isRateLimit = err.response && err.response.status === 429;

        if (isRateLimit) {
          setErrorMessage(
            'The AI service is currently busy. Please try again in a few minutes.'
          );
          dispatch(
            addMessage(
              chatId,
              "I'm sorry, but I'm receiving too many requests right now. Please try again in a few minutes.",
              false
            )
          );
        } else {
          setErrorMessage(
            `Error analyzing image: ${err.message || 'Unknown error'}`
          );
          dispatch(
            addMessage(
              chatId,
              "Sorry, I couldn't analyze this image. Please try uploading a clearer image of the test report.",
              false
            )
          );
        }

        setAnalysisProgress(0);
        setUploadingImage(false);
      })
      .finally(() => {
        // Only reset the uploading state after a longer delay
        // to ensure all UI elements are properly displayed
        setTimeout(() => {
          setUploadingImage(false);
        }, 2000); // Increased from 1000ms to 2000ms
      });
  };

  // Add this helper function near the top of your component
  const formatImageUrl = (url) => {
    if (!url) return '';

    // If it's already an absolute URL or starts with / (server path), use as is
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }

    // Otherwise, add the uploads prefix
    return `/uploads/${url}`;
  };

  // Update the renderMessageContent function to use the modal

  const renderMessageContent = (content, msg) => {
    // Check if this message has an associated image
    if (msg && msg.imageUrl) {
      return (
        <>
          <div className='message-image-container mb-2'>
            <Image
              src={msg.imageUrl}
              alt='Medical Report'
              fluid
              className='message-image'
              onClick={() => {
                setModalImage(msg.imageUrl);
                setShowImageModal(true);
              }}
            />
            <div className='image-actions text-center'>
              <Button
                variant='link'
                size='sm'
                onClick={() => {
                  setModalImage(msg.imageUrl);
                  setShowImageModal(true);
                }}
                className='mt-1'
              >
                View Full Size
              </Button>
            </div>
          </div>
          {content && content.trim() !== ' ' && (
            <div className='analysis-result-container'>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </>
      );
    }

    // Regular text message
    return content ? <ReactMarkdown>{content}</ReactMarkdown> : null;
  };

  // Model information display component
  const ModelInfoBadge = ({ modelName, confidence }) => {
    let badgeVariant = 'info';
    let displayName = modelName || 'AI';

    // Determine badge style based on model
    if (modelName) {
      if (modelName.includes('gemini')) {
        badgeVariant = 'primary';
        displayName = 'Google Gemini AI';
      } else if (modelName === 'ocr-space') {
        badgeVariant = 'success';
        displayName = 'OCR.Space';
      }
    }

    return (
      <small className={`badge bg-${badgeVariant} me-2`}>{displayName}</small>
    );
  };

  // Add a customized AnalysisResultCard component for better display of analysis results

  const AnalysisResultCard = ({ content }) => {
    // Extract the test type (or default to Medical Test Results)
    const extractTestType = (markdown) => {
      try {
        const titleMatch = markdown.match(/Medical ([^#\n]+) Analysis/i);
        return titleMatch
          ? `${titleMatch[1]} Analysis`
          : 'Medical Test Analysis';
      } catch (error) {
        return 'Medical Test Analysis';
      }
    };

    return (
      <div className='analysis-card'>
        <div className='analysis-header'>
          <span>{extractTestType(content)}</span>
          {usedModel && (
            <small className='model-info'>
              via {usedModel === 'ocr-space' ? 'OCR.Space' : usedModel}
              {ocrConfidence !== null && ` (${ocrConfidence}% confidence)`}
            </small>
          )}
        </div>
        <div className='analysis-content'>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  // Modify the chat message mapping section

  // Create a ChatMessage component for better structure
  const ChatMessage = ({ message }) => {
    const isUser = message.sender === 'user';
    const messageClass = isUser ? 'user-message' : 'ai-message';
    const isAnalysis = !isUser && message.isAnalysis;

    // Check if the message has an image URL
    const hasImage = message.imageUrl && message.imageUrl.trim() !== '';
    // Check if the message has content
    const hasContent =
      message.content &&
      message.content.trim() !== '' &&
      message.content.trim() !== ' ';

    return (
      <ListGroup.Item
        className={
          isAnalysis ? `${messageClass} analysis-message` : messageClass
        }
      >
        <strong>{isUser ? userInfo.name : 'AI Assistant'}</strong>
        <div className='message-content'>
          {/* Always display image if present, regardless of content */}
          {hasImage && (
            <div className='message-image-container mb-2'>
              <Image
                src={formatImageUrl(message.imageUrl)}
                alt='Medical Report'
                fluid
                className='message-image'
                onClick={() => {
                  setModalImage(formatImageUrl(message.imageUrl));
                  setShowImageModal(true);
                }}
              />
              <div className='image-actions text-center'>
                <Button
                  variant='link'
                  size='sm'
                  onClick={() => {
                    setModalImage(formatImageUrl(message.imageUrl));
                    setShowImageModal(true);
                  }}
                  className='mt-1'
                >
                  View Full Size
                </Button>
              </div>
            </div>
          )}

          {/* Display message content appropriately */}
          {isAnalysis ? (
            // Use the updated non-collapsible analysis card
            <AnalysisResultCard content={message.content} />
          ) : (
            // Only render content if it exists and isn't just whitespace
            hasContent && <ReactMarkdown>{message.content}</ReactMarkdown>
          )}

          {/* Show a placeholder if neither content nor image exists */}
          {!hasContent && !hasImage && (
            <em className='text-muted'>Empty message</em>
          )}
        </div>
      </ListGroup.Item>
    );
  };

  // Enhanced ImageViewerModal with zoom functionality

  const ImageViewerModal = ({ show, onHide, imageUrl }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => {
      setZoom((prev) => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
      setZoom((prev) => Math.max(prev - 0.5, 1));
    };

    const handleMouseDown = (e) => {
      if (zoom > 1) {
        setDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    };

    const handleMouseMove = (e) => {
      if (dragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    const resetZoom = () => {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };

    // Reset state when modal is closed
    useEffect(() => {
      if (!show) {
        resetZoom();
      }
    }, [show]);

    return (
      <Modal
        show={show}
        onHide={onHide}
        size='lg'
        centered
        className='image-viewer-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>Medical Report Image</Modal.Title>
          <div className='ms-auto me-2 d-flex align-items-center'>
            <Button
              variant='outline-light'
              size='sm'
              onClick={handleZoomOut}
              className='me-1'
            >
              <i className='fas fa-search-minus'></i>
            </Button>
            <span className='zoom-level mx-2'>{zoom.toFixed(1)}x</span>
            <Button
              variant='outline-light'
              size='sm'
              onClick={handleZoomIn}
              className='ms-1'
            >
              <i className='fas fa-search-plus'></i>
            </Button>
            {zoom > 1 && (
              <Button
                variant='outline-light'
                size='sm'
                onClick={resetZoom}
                className='ms-2'
              >
                Reset
              </Button>
            )}
          </div>
        </Modal.Header>
        <Modal.Body className='p-0 text-center'>
          <div
            className='image-viewer-container'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            <Image
              src={imageUrl}
              alt='Medical Report'
              className='full-size-image'
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${
                  position.y / zoom
                }px)`,
                transition: dragging ? 'none' : 'transform 0.2s ease-out',
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={onHide}>
            Close
          </Button>
          <Button
            variant='primary'
            href={imageUrl}
            download='medical-report.jpg'
            target='_blank'
          >
            Download
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <>
      {/* Go Back Link */}
      <Link to='/chats' className='btn btn-light mb-3'>
        <FaArrowLeft className='me-2' /> Back to Chats
      </Link>

      <div className='chat-container'>
        <Card className='chat-card'>
          <Card.Header className='d-flex justify-content-between align-items-center'>
            <h2>Medical Test Report Analysis</h2>
            {usedModel && (
              <div className='d-flex align-items-center'>
                <ModelInfoBadge modelName={usedModel} />
                {ocrConfidence !== null && (
                  <span
                    className={`badge ${
                      ocrConfidence > 85
                        ? 'bg-success'
                        : ocrConfidence > 70
                        ? 'bg-warning'
                        : 'bg-danger'
                    } ms-2`}
                  >
                    {ocrConfidence}% confidence
                  </span>
                )}
              </div>
            )}
          </Card.Header>

          <div className='messages-container'>
            {loading ? (
              <div className='text-center p-4'>
                <Spinner animation='border' />
              </div>
            ) : error ? (
              <div className='p-3'>
                <Message variant='danger'>{error}</Message>
              </div>
            ) : (
              <ListGroup variant='flush' className='chat-messages'>
                {/* Initial system message */}
                <ListGroup.Item className='ai-message'>
                  <strong>AI Assistant</strong>
                  <div className='message-content'>
                    <p>
                      Welcome to the Medical Test Report Analysis service.
                      Upload images of your medical test reports for analysis.
                    </p>
                  </div>
                </ListGroup.Item>

                {/* Chat messages with enhanced display for AI analysis responses */}
                {chat.messages &&
                  chat.messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))}

                {/* AI typing indicator */}
                {waitingForAIResponse && (
                  <ListGroup.Item className='ai-message'>
                    <strong>AI Assistant</strong>
                    <div className='message-content'>
                      <div className='typing-indicator'>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </ListGroup.Item>
                )}

                {/* Loading indicators */}
                {loadingAddMessage && (
                  <ListGroup.Item className='text-center p-2'>
                    <Spinner animation='border' size='sm' /> Sending message...
                  </ListGroup.Item>
                )}

                {/* Analysis specific loading indicator */}
                {loadingAnalysis && (
                  <ListGroup.Item className='ai-message p-2'>
                    <strong>AI Assistant</strong>
                    <div className='message-content'>
                      <div className='d-flex align-items-center'>
                        <Spinner
                          animation='border'
                          size='sm'
                          className='mr-2'
                        />
                        <span>
                          Processing your medical test report. This may take a
                          moment depending on the complexity...
                        </span>
                      </div>
                    </div>
                  </ListGroup.Item>
                )}

                {/* Analysis progress bar */}
                {uploadingImage && analysisProgress > 0 && (
                  <ListGroup.Item className='p-2'>
                    <div className='mb-1 small text-muted'>
                      {analysisProgress < 40 && 'Preparing report...'}
                      {analysisProgress >= 40 &&
                        analysisProgress < 75 &&
                        'Analyzing medical data...'}
                      {analysisProgress >= 75 && 'Finalizing results...'}
                    </div>
                    <ProgressBar
                      animated
                      now={analysisProgress}
                      label={`${analysisProgress}%`}
                      variant={analysisProgress < 100 ? 'info' : 'success'}
                    />
                  </ListGroup.Item>
                )}

                {/* Analysis completion indicator with animation */}
                {analysisLoaded && (
                  <ListGroup.Item className='text-center p-3'>
                    <div className='analysis-complete-indicator'>
                      <div className='checkmark-circle'>
                        <div className='checkmark-stem'></div>
                        <div className='checkmark-kick'></div>
                      </div>
                      <div>Analysis Complete!</div>
                      {usedModel && (
                        <small className='text-muted mt-2 d-block'>
                          Analyzed with{' '}
                          {usedModel === 'ocr-space' ? 'OCR.Space' : usedModel}
                        </small>
                      )}
                    </div>
                  </ListGroup.Item>
                )}

                {/* Image preview with potential analysis */}
                {previewImage && (
                  <ListGroup.Item className='p-2'>
                    <small className='text-muted'>Test Report Image:</small>
                    <div className='text-center'>
                      <Image
                        src={previewImage}
                        alt='Preview'
                        fluid
                        className='preview-image'
                      />
                    </div>
                  </ListGroup.Item>
                )}

                {/* Error message */}
                {errorMessage && (
                  <ListGroup.Item className='p-2'>
                    <Alert variant='danger' className='mb-0 py-2'>
                      {errorMessage}
                    </Alert>
                  </ListGroup.Item>
                )}

                {/* Reference for scrolling */}
                <div ref={messagesEndRef} />
              </ListGroup>
            )}
          </div>

          <Card.Footer>
            <Form onSubmit={submitMessageHandler}>
              <Row className='align-items-center'>
                <Col xs={9} md={10}>
                  <Form.Control
                    type='text'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Type your message here...'
                    disabled={uploadingImage || loadingAddMessage}
                  />
                </Col>
                <Col xs={3} md={2} className='d-flex'>
                  <div className='upload-btn-wrapper'>
                    <Button
                      variant='outline-secondary'
                      size='bg-sm'
                      disabled={uploadingImage || loadingAddMessage}
                    >
                      <FaPaperclip />
                    </Button>
                    <input
                      type='file'
                      onChange={uploadFileHandler}
                      disabled={uploadingImage || loadingAddMessage}
                      accept='image/*'
                    />
                  </div>
                  <Button
                    type='submit'
                    variant='primary'
                    size='bg-sm'
                    disabled={
                      !message.trim() || uploadingImage || loadingAddMessage
                    }
                  >
                    <FaPaperPlane />
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Footer>
        </Card>

        {/* Image viewer modal */}
        <ImageViewerModal
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          imageUrl={modalImage}
        />
      </div>
    </>
  );
};

export default ChatScreen;
