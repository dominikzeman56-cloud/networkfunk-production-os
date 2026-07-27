#!/usr/bin/env python3
"""
NPOS Ableton Template Generator
Generates a complete Ableton Live template for Neurofunk production.
"""

import json
import os
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom


class NPOSTemplateGenerator:
    def __init__(self, config_path="Template-Settings.json"):
        self.config = self.load_config(config_path)
        self.project_dir = Path("Project8_3")

    def load_config(self, path):
        with open(path, 'r') as f:
            return json.load(f)

    def generate_als(self):
        """Generate the Ableton Live Set (.als) file."""
        root = Element('AbletonProject', {
            'Type': 'Set',
            'Creator': 'Ableton',
            'MajorVersion': '6',
            'MinorVersion': '0'
        })

        # Project info
        SubElement(root, 'Name').text = self.config['project']['name']
        SubElement(root, 'Tempo').text = str(self.config['project']['tempo'])
        st = SubElement(root, 'TimeSignature', {
            'Numerator': str(self.config['project']['timeSignature']['numerator']),
            'Denominator': str(self.config['project']['timeSignature']['denominator'])
        })

        # Audio tracks
        for track in self.config['audioTracks']:
            self.create_audio_track(root, track)

        # MIDI tracks
        for track in self.config['midiTracks']:
            self.create_midi_track(root, track)

        # Return tracks
        for ret in self.config['returns']:
            self.create_return_track(root, ret)

        # Master track
        self.create_master_track(root)

        return self.pretty_xml(root)

    def create_audio_track(self, parent, track):
        track_elem = SubElement(parent, 'AudioTrack')
        SubElement(track_elem, 'TrackColor').text = track['color'].replace('#', '')
        SubElement(track_elem, 'Name').text = track['name']

        device_chain = SubElement(track_elem, 'DeviceChain')
        SubElement(device_chain, 'Eq8')

        mixer = SubElement(track_elem, 'Mixer')
        SubElement(mixer, 'Volume', {'Value': str(track['volume'])})
        SubElement(mixer, 'Pan', {'Value': str(track['pan'])})
        SubElement(mixer, 'Mute', {'Value': '0'})
        SubElement(mixer, 'Solo', {'Value': '0'})

    def create_midi_track(self, parent, track):
        track_elem = SubElement(parent, 'MidiTrack')
        SubElement(track_elem, 'TrackColor').text = track['color'].replace('#', '')
        SubElement(track_elem, 'Name').text = track['name']

        device_chain = SubElement(track_elem, 'DeviceChain')
        SubElement(device_chain, 'MidiEffect')
        SubElement(device_chain, 'Instrument')

        mixer = SubElement(track_elem, 'Mixer')
        SubElement(mixer, 'Volume', {'Value': str(track['volume'])})
        SubElement(mixer, 'Pan', {'Value': str(track['pan'])})
        SubElement(mixer, 'Mute', {'Value': '0'})
        SubElement(mixer, 'Solo', {'Value': '0'})

    def create_return_track(self, parent, ret):
        ret_elem = SubElement(parent, 'ReturnTrack')
        SubElement(ret_elem, 'TrackColor').text = ret['color'].replace('#', '')
        SubElement(ret_elem, 'Name').text = ret['name']

        device_chain = SubElement(ret_elem, 'DeviceChain')
        SubElement(device_chain, 'Reverb')

        mixer = SubElement(ret_elem, 'Mixer')
        SubElement(mixer, 'Volume', {'Value': str(ret['volume'])})
        SubElement(mixer, 'Mute', {'Value': '0'})

    def create_master_track(self, parent):
        master = SubElement(parent, 'MasterTrack')
        SubElement(master, 'TrackColor').text = 'FFFFFF'
        SubElement(master, 'Name').text = 'Master'

        device_chain = SubElement(master, 'DeviceChain')
        SubElement(device_chain, 'Eq8')
        limiter = SubElement(device_chain, 'Limiter')
        SubElement(limiter, 'Ceiling').text = '-1'
        SubElement(limiter, 'InputGain').text = '0'

        mixer = SubElement(master, 'Mixer')
        SubElement(mixer, 'Volume', {'Value': '0.794328'})

    def pretty_xml(self, elem):
        rough = tostring(elem, encoding='unicode')
        reparsed = minidom.parseString(rough)
        return reparsed.toprettyxml(indent='    ')

    def generate(self, output_dir='.'):
        output_path = Path(output_dir)
        project_path = output_path / 'Project8_3'

        # Create directories
        project_path.mkdir(parents=True, exist_ok=True)

        # Generate ALS file
        als_content = self.generate_als()
        (project_path / 'Session.als').write_text(als_content)

        # Generate CFG file
        cfg_content = f"""[Project]
Version = 6.0.0
Name = {self.config['project']['name']}
Tempo = {self.config['project']['tempo']}
TimeSignature = {self.config['project']['timeSignature']['numerator']} {self.config['project']['timeSignature']['denominator']}

[AudioEngine]
SampleRate = {self.config['project']['sampleRate']}
BufferSize = {self.config['project']['bufferSize']}

[Mixer]
MasterVolume = 0.8

[Tracks]
AudioTrackCount = {len(self.config['audioTracks'])}
MidiTrackCount = {len(self.config['midiTracks'])}
ReturnCount = {len(self.config['returns'])}"""
        (project_path / 'Project8_3.cfg').write_text(cfg_content)

        return {
            'status': 'success',
            'files_created': [
                str(project_path / 'Session.als'),
                str(project_path / 'Project8_3.cfg'),
                str(output_path / 'Template-Settings.json')
            ]
        }


if __name__ == '__main__':
    generator = NPOSTemplateGenerator()
    result = generator.generate()
    print(json.dumps(result, indent=2))