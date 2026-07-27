<?xml version="1.0" encoding="UTF-8"?>
<AbletonProject Type="Set" Creator="Ableton" MajorVersion="6" MinorVersion="0">
    <Name>NPOS Neurofunk Template</Name>
    <Tempo>174</Tempo>
    <TimeSignature Numerator="4" Denominator="4"/>
    <MajorVersion>6</MajorVersion>
    <MinorVersion>0</MinorVersion>

    <!-- Audio Tracks -->
    <AudioTrack>
        <TrackColor>FF4444</TrackColor>
        <Name>Kick</Name>
        <DeviceChain>
            <AutoFilter>
                <Chain>
                </Chain>
            </AutoFilter>
            <Eq8>
                <ChainList>
                </ChainList>
            </Eq8>
            <Saturation>
                <Drive>5</Drive>
                <Mix>30</Mix>
            </Saturation>
            <Compressor>
                <Ratio>4</Ratio>
                <Threshold>-12</Threshold>
                <Attack>0.1</Attack>
                <Release>80</Release>
                <Makeup>6</Makeup>
            </Compressor>
            <Limiter>
                <Ceiling>-1</Ceiling>
                <InputGain>0</InputGain>
            </Limiter>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.795824"/>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </AudioTrack>

    <AudioTrack>
        <TrackColor>FF6644</TrackColor>
        <Name>Snare</Name>
        <DeviceChain>
            <Eq8>
                <ChainList>
                </ChainList>
            </Eq8>
            <Saturation>
                <Drive>10</Drive>
                <Mix>40</Mix>
            </Saturation>
            <Compressor>
                <Ratio>6</Ratio>
                <Threshold>-18</Threshold>
                <Attack>0.1</Attack>
                <Release>100</Release>
                <Makeup>8</Makeup>
            </Compressor>
            <Reverb>
                <Size>0.3</Size>
                <DecayTime>1.2</DecayTime>
                <Mix>25</Mix>
                <Predelay>10</Predelay>
            </Reverb>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.749894</Volume>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </AudioTrack>

    <AudioTrack>
        <TrackColor>FFAA44</TrackColor>
        <Name>Hi-Hats</Name>
        <DeviceChain>
            <Eq8>
                <ChainList>
                </ChainList>
            </Eq8>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.659754</Volume>
            <Pan Value="-0.15"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </AudioTrack>

    <AudioTrack>
        <TrackColor>44AA44</TrackColor>
        <Name>Percussion</Name>
        <DeviceChain>
            <Eq8>
                <ChainList>
                </ChainList>
            </Eq8>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.707946</Volume>
            <Pan Value="0.15"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </AudioTrack>

    <!-- MIDI Bass Tracks -->
    <MidiTrack>
        <TrackColor>4444FF</TrackColor>
        <Name>Bass Sub</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.841395</Volume>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>

    <MidiTrack>
        <TrackColor>4466FF</TrackColor>
        <Name>Bass Body</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.794328</Volume>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>

    <MidiTrack>
        <TrackColor>4488FF</TrackColor>
        <Name>Bass Modulation</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.707946</Volume>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>

    <MidiTrack>
        <TrackColor>44AAFF</TrackColor>
        <Name>Bass Texture</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.630957</Volume>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>

    <MidiTrack>
        <TrackColor>44CC44</TrackColor>
        <Name>Atmosphere</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.562341</Volume>
            <Pan Value="-0.2"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>

    <MidiTrack>
        <TrackColor>CC44CC</TrackColor>
        <Name>FX</Name>
        <DeviceChain>
            <MidiEffect>
            </MidiEffect>
            <Instrument>
            </Instrument>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.501187</Volume>
            <Pan Value="0"/>
            <Mute Value="0"/>
            <Solo Value="0"/>
        </Mixer>
    </MidiTrack>

    <!-- Return Tracks -->
    <ReturnTrack>
        <TrackColor>666666</TrackColor>
        <Name>Reverb Short</Name>
        <DeviceChain>
            <Reverb>
                <Size>0.25</Size>
                <DecayTime>0.8</DecayTime>
                <Diffusion>50</Diffusion>
                <Mix>30</Mix>
            </Reverb>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.501187</Volume>
            <Mute Value="0"/>
        </Mixer>
    </ReturnTrack>

    <ReturnTrack>
        <TrackColor>777777</TrackColor>
        <Name>Reverb Long</Name>
        <DeviceChain>
            <Reverb>
                <Size>0.7</Size>
                <DecayTime>3.0</DecayTime>
                <Diffusion>70</Diffusion>
                <Mix>40</Mix>
            </Reverb>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.398107</Volume>
            <Mute Value="0"/>
        </Mixer>
    </ReturnTrack>

    <ReturnTrack>
        <TrackColor>888888</TrackColor>
        <Name>Delay</Name>
        <DeviceChain>
            <PingPongDelay>
                <Time>1/8</Time>
                <Feedback>35</Feedback>
                <Mix>30</Mix>
            </PingPongDelay>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.447214</Volume>
            <Mute Value="0"/>
        </Mixer>
    </ReturnTrack>

    <ReturnTrack>
        <TrackColor>555555</TrackColor>
        <Name>Saturation Bus</Name>
        <DeviceChain>
            <Saturation>
                <Drive>12</Drive>
                <Mix>50</Mix>
            </Saturation>
            <Eq8>
                <ChainList>
                </ChainList>
            </Eq8>
            <Compressor>
                <Ratio>2</Ratio>
                <Threshold>-12</Threshold>
                <Attack>10</Attack>
                <Release>150</Release>
            </Compressor>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.630957</Volume>
            <Mute Value="0"/>
        </Mixer>
    </ReturnTrack>

    <!-- Master Track -->
    <MasterTrack>
        <TrackColor>FFFFFF</TrackColor>
        <Name>Master</Name>
        <DeviceChain>
            <Eq8>
                <ChainList>
                </ChainList>
            </Eq8>
            <Limiter>
                <Ceiling>-1</Ceiling>
                <InputGain>0</InputGain>
            </Limiter>
        </DeviceChain>
        <Mixer>
            <Volume Value="0.794328"/>
        </Mixer>
    </MasterTrack>

</AbletonProject>