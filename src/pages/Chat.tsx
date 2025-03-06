import React, { useState, useRef, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Input,
  Button,
  Avatar,
  Text,
  TabList,
  Tab,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  Field,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Persona,
  CompoundButton,
  Checkbox,
  DialogActions,
} from '@fluentui/react-components';
import {
  Send24Regular,
  Add24Regular,
  Search24Regular,
  Emoji24Regular,
  AttachRegular,
  PersonAdd24Regular,
  NumberSymbol24Regular,
  Dismiss24Regular,
  Filter24Regular,
  ArrowLeft24Regular,
} from '@fluentui/react-icons';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useChatStore } from '../store/chatStore';
import type { Message, Attachment, User } from '../types';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    height: '100%',
  },
  sidebar: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke1),
    display: 'flex',
    flexDirection: 'column',
  },
  channelList: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
  },
  channelItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  channelName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '4px',
  },
  activeChannel: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Selected,
    },
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  message: {
    display: 'flex',
    gap: '12px',
    maxWidth: '80%',
  },
  messageContent: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '12px',
    borderRadius: '12px',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  input: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  inputControls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    width: '100%',
  },
  searchContainer: {
    padding: '12px',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  attachments: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px 0',
  },
  attachment: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  emojiPicker: {
    '& .EmojiPickerReact': {
      '--epr-bg-color': tokens.colorNeutralBackground1,
      '--epr-category-label-bg-color': tokens.colorNeutralBackground2,
      '--epr-hover-bg-color': tokens.colorNeutralBackground2,
      '--epr-focus-bg-color': tokens.colorNeutralBackground2,
      '--epr-search-border-color': tokens.colorNeutralStroke1,
    },
  },
  searchDialog: {
    width: '600px',
    height: '400px',
  },
  searchResults: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  searchResult: {
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  searchFilters: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  addPeopleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  personItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
});

const mockUsers: User[] = [
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com' },
  { id: '5', name: 'Carol Brown', email: 'carol@example.com' },
];

const Chat: React.FC = () => {
  const styles = useStyles();
  const [message, setMessage] = useState('');
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, channels, activeChannel, setActiveChannel, addMessage } = useChatStore();

  const filteredMessages = messages.filter((msg) => msg.channelId === activeChannel);
  const currentChannel = channels.find((c) => c.id === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = messages.filter(
        (msg) =>
          msg.channelId === activeChannel &&
          (msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddPeople = () => {
    console.log('Adding users:', Array.from(selectedUsers));
    setSelectedUsers(new Set());
    setIsAddPeopleOpen(false);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && activeChannel) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        timestamp: new Date(),
        channelId: activeChannel,
        type: 'text',
        attachments: attachments.map(file => ({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size,
          uploadedAt: new Date(),
        })),
      };
      addMessage(newMessage);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <div className={styles.searchContainer}>
          <Input
            contentBefore={<Search24Regular />}
            placeholder="Search channels..."
          />
        </div>
        <div style={{ padding: '12px' }}>
          <Button
            icon={<Add24Regular />}
            onClick={() => setIsNewChannelOpen(true)}
          >
            New Channel
          </Button>
        </div>
        <div className={styles.channelList}>
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`${styles.channelItem} ${
                channel.id === activeChannel ? styles.activeChannel : ''
              }`}
              onClick={() => setActiveChannel(channel.id)}
            >
              <div className={styles.channelName}>
                <NumberSymbol24Regular />
                <Text weight="semibold">{channel.name}</Text>
              </div>
              <Badge shape="rounded">{
                messages.filter(m => m.channelId === channel.id).length
              }</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberSymbol24Regular />
              <Text weight="semibold" size={500}>
                {currentChannel?.name}
              </Text>
            </div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground2, marginLeft: '28px' }}>
              {currentChannel?.description}
            </Text>
          </div>
          <div className={styles.headerActions}>
            <Button 
              icon={<PersonAdd24Regular />}
              onClick={() => setIsAddPeopleOpen(true)}
            >
              Add People
            </Button>
            <Button 
              icon={<Search24Regular />}
              onClick={() => setIsSearchOpen(true)}
            >
              Search
            </Button>
          </div>
        </div>

        <div className={styles.messages}>
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <Avatar name={msg.sender.name} size={32} />
              <div>
                <div style={{ marginBottom: '4px' }}>
                  <Text weight="semibold">{msg.sender.name}</Text>
                  <Text
                    size={200}
                    style={{
                      marginLeft: '8px',
                      color: tokens.colorNeutralForeground2,
                    }}
                  >
                    {format(msg.timestamp, 'h:mm a')}
                  </Text>
                </div>
                <div className={styles.messageContent}>
                  <Text>{msg.content}</Text>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={styles.attachments}>
                      {msg.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.attachment}
                        >
                          <AttachRegular />
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.input}>
          {attachments.length > 0 && (
            <div className={styles.attachments}>
              {attachments.map((file, index) => (
                <div key={index} className={styles.attachment}>
                  <AttachRegular />
                  {file.name}
                  <Button
                    icon={<Dismiss24Regular />}
                    size="small"
                    onClick={() => removeAttachment(index)}
                  />
                </div>
              ))}
            </div>
          )}
          <div className={styles.inputControls}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
            />
            <Button icon={<AttachRegular />} onClick={() => fileInputRef.current?.click()} />
            <Popover>
              <PopoverTrigger>
                <Button icon={<Emoji24Regular />} />
              </PopoverTrigger>
              <PopoverSurface className={styles.emojiPicker}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </PopoverSurface>
            </Popover>
            <Input
              value={message}
              onChange={(e, data) => setMessage(data.value)}
              placeholder="Type a message..."
              style={{ flex: 1 }}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={5}
            />
            <Button
              icon={<Send24Regular />}
              onClick={handleSend}
              disabled={!message.trim() && attachments.length === 0}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={isSearchOpen}
        onOpenChange={(_, { open }) => setIsSearchOpen(open)}
      >
        <DialogSurface className={styles.searchDialog}>
          <DialogBody>
            <DialogTitle>Search in {currentChannel?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  value={searchQuery}
                  onChange={(e, data) => setSearchQuery(data.value)}
                  placeholder="Search messages..."
                  contentBefore={<Search24Regular />}
                  style={{ flex: 1 }}
                />
                <Button icon={<Filter24Regular />}>Filters</Button>
              </div>
              <div className={styles.searchResults}>
                {searchResults.map((result) => (
                  <div key={result.id} className={styles.searchResult}>
                    <Text weight="semibold">{result.sender.name}</Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                      {format(result.timestamp, 'MMM d, yyyy h:mm a')}
                    </Text>
                    <Text>{result.content}</Text>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsSearchOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog
        open={isAddPeopleOpen}
        onOpenChange={(_, { open }) => setIsAddPeopleOpen(open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add people to {currentChannel?.name}</DialogTitle>
            <DialogContent>
              <Input
                placeholder="Search people..."
                contentBefore={<Search24Regular />}
              />
              <div className={styles.addPeopleList}>
                {mockUsers.map((user) => (
                  <div key={user.id} className={styles.personItem}>
                    <Persona
                      name={user.name}
                      secondaryText={user.email}
                      presence={{ status: 'available' }}
                      avatar={{ color: 'colorful' }}
                    />
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={handleAddPeople}
                disabled={selectedUsers.size === 0}
              >
                Add {selectedUsers.size} people
              </Button>
              <Button appearance="secondary" onClick={() => setIsAddPeopleOpen(false)}>
                Cancel
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog 
        open={isNewChannelOpen} 
        onOpenChange={(_, { open }) => setIsNewChannelOpen(open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Channel Name">
                  <Input placeholder="e.g. project-updates" />
                </Field>
                <Field label="Description">
                  <Input placeholder="What's this channel about?" />
                </Field>
                <Field label="Privacy">
                  <TabList defaultSelectedValue="public">
                    <Tab value="public">Public</Tab>
                    <Tab value="private">Private</Tab>
                  </TabList>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary">Create Channel</Button>
              <Button appearance="secondary" onClick={() => setIsNewChannelOpen(false)}>
                Cancel
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default Chat;