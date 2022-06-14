import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlowActionGroupOptions, SendMessageTo } from '../FlowActionGroupInput';
import { sortChannelsByNameAsc, sortMembersByDisplayNameAsc, useDiscordGuildMembers, useDiscordGuildTextChannels } from '../../../lib/api/Discord';

type Props = {
    index: number;
    value: FlowActionGroupOptions;
    setValue: React.Dispatch<React.SetStateAction<FlowActionGroupOptions>>;
}

const FlowActionBuildingBlockSendMessage: React.FC<Props> = ({ index, value, setValue }) => {
    const [toType, setToType] = useState(value.toType || SendMessageTo.SENDER);
    const [to, setTo] = useState(value.to || "");
    const [messageFormat, setMessageFormat] = useState(value.messageFormat || "");

    const { guildId } = useAppContext();
    const { error: guildChannelsError, data: guildChannelsData, isLoading: isGuildChannelsLoading } = useDiscordGuildTextChannels(guildId);
    const { error: guildMembersError, data: guildMembersData, isLoading: isGuildMembersLoading } = useDiscordGuildMembers(guildId);

    if (guildChannelsError) console.error(guildChannelsError);
    if (guildMembersError) console.error(guildMembersError);

    useEffect(() => {
        setValue({
            toType,
            to: toType !== SendMessageTo.SENDER ? to : undefined,
            messageFormat
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toType, to, messageFormat, index]);

    useEffect(() => {
        if (toType === SendMessageTo.USER && !isGuildMembersLoading && guildMembersData) {
            setTo(guildMembersData[0].userId);
        }

        if (toType === SendMessageTo.CHANNEL && !isGuildChannelsLoading && guildChannelsData) {
            setTo(guildChannelsData[0].id);
        }
    }, [toType, isGuildMembersLoading, isGuildChannelsLoading, guildMembersData, guildChannelsData])

    return (
        <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
                <label htmlFor={`buildingBlockSendMessage${index}_toType`} className='block font-bold'>To:</label>
                <select name={`buildingBlockSendMessage${index}_toType`} id={`buildingBlockSendMessage${index}_toType`} className='w-full rounded-r-md bg-black bg-opacity-30 border-none' value={toType} onChange={(e) => setToType(parseInt(e.currentTarget.value))}>
                    <option value={SendMessageTo.SENDER} className='bg-black bg-opacity-90'>Sender</option>
                    <option value={SendMessageTo.USER} className='bg-black bg-opacity-90'>User</option>
                    <option value={SendMessageTo.CHANNEL} className='bg-black bg-opacity-90'>Channel</option>
                </select>
                <small className='block'>Please select where to send the message here.</small>
            </div>
            {toType === SendMessageTo.USER &&
                <div>
                    <label htmlFor={`buildingBlockSendMessage${index}_to`} className='block font-bold'>User:</label>
                    <select name={`buildingBlockSendMessage${index}_to`} id={`buildingBlockSendMessage${index}_to`} className='w-full rounded-r-md bg-black bg-opacity-30 border-none' value={to} onChange={(e) => setTo(e.currentTarget.value)}>
                        {!isGuildMembersLoading && guildMembersData?.sort(sortMembersByDisplayNameAsc).map(guildMember => <option key={guildMember.userId} value={guildMember.userId} className='bg-black bg-opacity-90'>{guildMember.displayName}</option>)}
                    </select>
                    <small className='block'>Please select the user here.</small>
                </div>
            }
            {toType === SendMessageTo.CHANNEL &&
                <div>
                    <label htmlFor={`buildingBlockSendMessage${index}_to`} className='block font-bold'>Channel:</label>
                    <select name={`buildingBlockSendMessage${index}_to`} id={`buildingBlockSendMessage${index}_to`} className='w-full rounded-r-md bg-black bg-opacity-30 border-none' value={to} onChange={(e) => setTo(e.currentTarget.value)}>
                        {!isGuildChannelsLoading && guildChannelsData?.sort(sortChannelsByNameAsc).map(guildChannel => <option key={guildChannel.id} value={guildChannel.id} className='bg-black bg-opacity-90'>{guildChannel.name}</option>)}
                    </select>
                    <small className='block'>Please select channel here.</small>
                </div>
            }
            <div className='col-span-full'>
                <label htmlFor="messageText" className='block font-bold'>Message format:</label>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <div className='sm:col-span-2'>
                        <textarea name="messageText" id="messageText" className='w-full rounded-md bg-black bg-opacity-30 border-none' placeholder='A message to send!' value={messageFormat} onChange={(e) => setMessageFormat(e.currentTarget.value)} rows={10} />
                        <small className='block'>Please enter a message text here.</small>
                    </div>
                    <div>
                        <p>You can use variables in the message format field like so: <strong>&#123;&#123; variableName &#125;&#125;</strong>.</p>
                        <p className='mt-2'>You can make use of the following variables:</p>
                        <ul>
                            <li>
                                <p><strong>guild</strong>: this contains information about the guild.</p>
                            </li>
                            <li>
                                <p><strong>guildMember</strong>: this contains information about the member that reacted.</p>
                            </li>
                            <li>
                                <p><strong>user</strong>: this contains information about the user that reacted.</p>
                            </li>
                            <li>
                                <p><strong>reaction</strong>: this contains information about the reaction that was given.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FlowActionBuildingBlockSendMessage;
