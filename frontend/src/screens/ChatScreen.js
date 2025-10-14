import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Image,
  Spinner,
  Alert,
  Modal,
  Badge,
  Dropdown,
  InputGroup,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
import {
  FaPaperPlane,
  FaArrowLeft,
  FaImage,
  FaDownload,
  FaThumbsUp,
  FaThumbsDown,
  FaCopy,
  FaExpand,
  FaCompress,
  FaEye,
  FaMicrophone,
  FaStop,
  FaEdit,
  FaTrash,
  FaCog,
  FaShare,
  FaStethoscope,
  FaRobot,
  FaUser,
  FaExclamationTriangle,
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { getChatDetails, addMessage, updateChat } from '../actions/chatActions';
import { CHAT_DETAILS_SUCCESS } from '../constants/chatConstants';
import './ChatScreen.css';

const ChatScreen = () => {
  // State management
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chatSettings, setChatSettings] = useState({
    title: '',
    description: '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: chatId } = useParams();

  // Redux selectors
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const chatDetails = useSelector((state) => state.chatDetails);
  const { loading, error, chat = {} } = chatDetails;

  const chatMessageAdd = useSelector((state) => state.chatMessageAdd) || {};
  const { loading: loadingAddMessage = false } = chatMessageAdd;

  const chatImageAnalyze = useSelector((state) => state.chatImageAnalyze) || {};
  const { loading: loadingAnalysis = false } = chatImageAnalyze;

  const aiResponseWaiting = useSelector((state) => state.aiResponseWaiting);

  // Effects
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    dispatch(getChatDetails(chatId));
  }, [dispatch, navigate, chatId, userInfo]);

  useEffect(() => {
    if (chat) {
      setChatSettings({
        title: chat.title || '',
        description: chat.description || '',
      });
    }
  }, [chat]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !loading) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }
      }, 100);
    }
  }, [chat.messages && chat.messages.length, loading]);

  // Clear messages after timeout
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Helper functions
  const formatImageUrl = useCallback((url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/uploads/${url}`;
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccessMessage('Content copied to clipboard!');
    });
  }, []);

  // Event handlers
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (loadingAddMessage || aiResponseWaiting || !message.trim()) {
        return;
      }

      const messageContent = message.trim();

      // Create temporary message for immediate display
      const tempMessage = {
        _id: 'temp-' + Date.now(),
        sender: 'user',
        content: messageContent,
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };

      // Update local state immediately
      const updatedChat = {
        ...chat,
        messages: [...(chat.messages || []), tempMessage],
      };

      dispatch({
        type: CHAT_DETAILS_SUCCESS,
        payload: updatedChat,
      });

      setMessage('');
      setIsTyping(false);

      // Send to server
      dispatch(addMessage(chatId, messageContent));
    },
    [loadingAddMessage, aiResponseWaiting, message, chat, dispatch, chatId]
  );

  const handleUpdateChat = useCallback(() => {
    dispatch(updateChat(chatId, chatSettings))
      .then(() => {
        setSuccessMessage('Chat settings updated successfully!');
        setShowSettingsModal(false);
      })
      .catch(() => {
        setErrorMessage('Failed to update chat settings');
      });
  }, [dispatch, chatId, chatSettings]);

  const startRecording = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setAudioBlob(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch(() => {
        setErrorMessage('Microphone access denied');
      });
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Message components
  const MessageItem = React.memo(({ msg, index }) => {
    const isUser = msg.sender === 'user';
    const isAnalysis = msg.messageType === 'analysis' || msg.isAnalysis;
    const hasImage = msg.imageUrl && msg.imageUrl.trim() !== '';
    const hasContent =
      msg.content && msg.content.trim() && msg.content.trim() !== ' ';

    return (
      <ListGroup.Item
        className={`message-item ${isUser ? 'user-message' : 'ai-message'} ${
          isAnalysis ? 'analysis-message' : ''
        }`}
      >
        <div className='message-header'>
          <div className='message-avatar'>
            {isUser ? (
              <FaUser className='avatar-icon user-avatar' />
            ) : (
              <FaRobot className='avatar-icon ai-avatar' />
            )}
          </div>
          <div className='message-info'>
            <strong className='message-sender'>
              {isUser ? (userInfo && userInfo.name) || 'You' : 'AI Assistant'}
            </strong>
            <small className='message-time'>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </small>
          </div>
          <div className='message-actions'>
            {!isUser && hasContent && (
              <OverlayTrigger
                placement='top'
                overlay={<Tooltip>Copy message</Tooltip>}
              >
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => copyToClipboard(msg.content)}
                >
                  <FaCopy />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        </div>

        <div className='message-content'>
          {hasImage && (
            <div className='message-image-container'>
              <Image
                src={formatImageUrl(msg.imageUrl)}
                alt='Medical Report'
                fluid
                className='message-image'
                onClick={() => {
                  setModalImage(formatImageUrl(msg.imageUrl));
                  setShowImageModal(true);
                }}
              />
              <div className='image-overlay'>
                <Button
                  variant='light'
                  size='sm'
                  onClick={() => {
                    setModalImage(formatImageUrl(msg.imageUrl));
                    setShowImageModal(true);
                  }}
                >
                  <FaExpand className='me-2' />
                  View Full Size
                </Button>
              </div>
            </div>
          )}

          {hasContent && (
            <div className='message-text'>
              {isAnalysis ? (
                <div className='analysis-content'>
                  <div className='analysis-header'>
                    <Badge bg='info' className='me-2'>
                      <FaStethoscope className='me-1' />
                      AI Medical Chat
                    </Badge>
                    {msg.analysisData && msg.analysisData.model && (
                      <Badge bg='secondary'>
                        {msg.analysisData.model}
                        {msg.analysisData.confidence &&
                          ` (${msg.analysisData.confidence}%)`}
                      </Badge>
                    )}
                  </div>
                  <ReactMarkdown className='analysis-markdown'>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          )}

          {!hasContent && !hasImage && (
            <em className='text-muted'>Processing...</em>
          )}
        </div>
      </ListGroup.Item>
    );
  });

  // Loading state
  if (loading && !chat._id) {
    return (
      <Container fluid className='chat-container'>
        <div className='loading-state'>
          <Spinner animation='border' variant='primary' />
          <p className='mt-3'>Loading your medical chat...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className='chat-container'>
      {/* Header */}
      <Row className='chat-header'>
        <Col>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center'>
              <Link to='/chats' className='btn btn-outline-light me-3'>
                <FaArrowLeft />
              </Link>
              <div>
                <h2 className='chat-title'>
                  <FaStethoscope className='me-2' />
                  {chat.title || 'AI Medical Chat'}
                </h2>
                <div className='chat-meta'>
                  <span className='text-muted'>
                    {chat.messages ? chat.messages.length : 0} messages •
                    Created {new Date(chat.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className='chat-actions'>
              <Button
                variant='outline-light'
                size='sm'
                onClick={() => setShowSettingsModal(true)}
                className='me-2'
              >
                <FaCog />
              </Button>
              <Dropdown>
                <Dropdown.Toggle variant='outline-light' size='sm'>
                  <i className='fas fa-ellipsis-v' />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowSettingsModal(true)}>
                    <FaEdit className='me-2' /> Edit Chat
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <FaShare className='me-2' /> Share
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className='text-danger'>
                    <FaTrash className='me-2' /> Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Col>
      </Row>

      {/* Messages Area */}
      <Row className='flex-grow-1'>
        <Col>
          <Card className='messages-card'>
            <Card.Body className='messages-body'>
              {/* Status Messages */}
              {errorMessage && (
                <Alert
                  variant='danger'
                  dismissible
                  onClose={() => setErrorMessage('')}
                >
                  <FaExclamationTriangle className='me-2' />
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert
                  variant='success'
                  dismissible
                  onClose={() => setSuccessMessage('')}
                >
                  {successMessage}
                </Alert>
              )}

              {/* Messages List */}
              <ListGroup variant='flush' className='messages-list'>
                {/* Welcome Message */}
                {(!chat.messages || chat.messages.length === 0) && (
                  <ListGroup.Item className='welcome-message'>
                    <div className='text-center py-4'>
                      <FaStethoscope size={48} className='text-primary mb-3' />
                      <h4>Welcome to AI Medical Chat</h4>
                      <p className='text-muted'>
                        Ask questions about your health, symptoms, medications,
                        or general medical topics. Our AI assistant will provide
                        helpful information and guidance.
                      </p>
                    </div>
                  </ListGroup.Item>
                )}

                {/* Chat Messages */}
                {chat.messages &&
                  chat.messages.map((msg, index) => (
                    <MessageItem
                      key={msg._id || index}
                      msg={msg}
                      index={index}
                    />
                  ))}

                {/* AI Typing Indicator */}
                {aiResponseWaiting && (
                  <ListGroup.Item className='ai-message typing-indicator'>
                    <div className='message-header'>
                      <div className='message-avatar'>
                        <FaRobot className='avatar-icon ai-avatar' />
                      </div>
                      <div className='message-info'>
                        <strong>AI Assistant</strong>
                      </div>
                    </div>
                    <div className='message-content'>
                      <div className='typing-animation'>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <small className='text-muted'>
                        Analyzing your medical data...
                      </small>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
              <div ref={messagesEndRef} />
            </Card.Body>

            {/* Input Area */}
            <Card.Footer className='message-input-area'>
              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <Form.Control
                    type='text'
                    placeholder='Ask about your medical results or type a message...'
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setIsTyping(e.target.value.length > 0);
                    }}
                    disabled={loadingAddMessage}
                    className='message-input'
                  />

                  {/* Voice Recording */}
                  <Button
                    variant={isRecording ? 'danger' : 'outline-secondary'}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loadingAddMessage}
                    title={isRecording ? 'Stop recording' : 'Voice message'}
                  >
                    {isRecording ? <FaStop /> : <FaMicrophone />}
                  </Button>

                  {/* Send Button */}
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={!message.trim() || loadingAddMessage}
                  >
                    {loadingAddMessage ? (
                      <Spinner animation='border' size='sm' />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </Button>
                </InputGroup>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Image Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        size='lg'
        centered
        className='image-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>Medical Report Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          <Image src={modalImage} fluid className='modal-image' />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowImageModal(false)}>
            Close
          </Button>
          <Button
            variant='primary'
            href={modalImage}
            download='medical-report.jpg'
            target='_blank'
          >
            <FaDownload className='me-2' />
            Download
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Settings Modal */}
      <Modal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chat Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type='text'
                value={chatSettings.title}
                onChange={(e) =>
                  setChatSettings({
                    ...chatSettings,
                    title: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={chatSettings.description}
                onChange={(e) =>
                  setChatSettings({
                    ...chatSettings,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => setShowSettingsModal(false)}
          >
            Cancel
          </Button>
          <Button variant='primary' onClick={handleUpdateChat}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ChatScreen;
