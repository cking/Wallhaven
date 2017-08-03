const e = window.DI.React.createElement;
const { SettingsExpandableSection, SettingsDivider, SettingsOptionTextbox, SettingsOptionToggle,
    SettingsDescription, SettingsTitle, SettingsOption, SettingsOptionFilebox, SettingsOptionTitle, SettingsSection, SettingsOptionButton, SettingsOptionDescription } = window.DI.require('./Structures/Components');
const {remote} = require('electron');

class SettingsTab extends window.DI.React.Component {
    render() {
        return e('div', {},

            e(SettingsOptionTextbox, {
                title: 'Search term',
                description: 'Search wallhaven for this term',
                plugin: this.props.plugin,
                lsNode: 'searchTerm',
                defaultValue: 'fate stay night',
                apply: true,
                onApply: () => console.log('Example Textbox was applied!')
            }),

            e(SettingsExpandableSection, {
                title: 'Extra Filter',
                components: [
                    e('div', {}, [
                        e('div', {
                            className: 'flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO switchItem-1uofoz',
                            style: { flex: '1 1 auto' }
                        }, [
                            e('div', {
                                className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO',
                                style: {
                                    flex: '1 1 auto'
                                }
                            }, [
                                e(SettingsOptionTitle, { text: 'Login' }),
                                e(SettingsOptionDescription, { text: 'Login in to Wallhaven to unlock NSFW content, etc...\nAfter logging in, close the window' }),
                                e(SettingsOptionButton, { outline: false, text: 'Login', onClick: () => {
                                    const win = new remote.BrowserWindow({width: 800, height: 600, show: true, parent: remote.getCurrentWindow()});
                                    win.loadURL(`https://alpha.wallhaven.cc/auth/login`);
                                }}),
                            ])
                        ]),
                    ]),

                    e(SettingsDivider),
                    e(SettingsDescription, {
                        text: 'Change the search results'
                    }),
                    e(SettingsOptionToggle, {
                        title: 'Enable General results',
                        plugin: this.props.plugin,
                        lsNode: 'categories-0',
                        defaultValue: true
                    }),
                    e(SettingsOptionToggle, {
                        title: 'Enable Anime results',
                        plugin: this.props.plugin,
                        lsNode: 'categories-1',
                        defaultValue: true
                    }),
                    e(SettingsOptionToggle, {
                        title: 'Enable People results',
                        plugin: this.props.plugin,
                        lsNode: 'categories-2',
                        defaultValue: false
                    }),

                    e(SettingsDivider),
                    e(SettingsDescription, {
                        text: 'Change the purity filter'
                    }),
                    e(SettingsOptionToggle, {
                        title: 'Enable SFW results',
                        plugin: this.props.plugin,
                        lsNode: 'purity-0',
                        defaultValue: true
                    }),
                    e(SettingsOptionToggle, {
                        title: 'Enable Sketchy results',
                        plugin: this.props.plugin,
                        lsNode: 'purity-1',
                        defaultValue: false
                    }),
                    e(SettingsOptionToggle, {
                        title: 'Enable NSFW results',
                        description: 'Requires a logged in account to work!',
                        plugin: this.props.plugin,
                        lsNode: 'purity-2',
                        defaultValue: false
                    }),
                ]
            }),
            
            e(SettingsExpandableSection, {
                title: 'Automation',
                components: [
                    e(SettingsOptionToggle, {
                        title: 'Enable automatic background changer',
                        description: 'If enabled the background will be changed using the given settings',
                        plugin: this.props.plugin,
                        lsNode: 'enabled',
                        defaultValue: false,
                        onApply: () => console.log("enabled:", this.state.enabled)
                    }),
                    e(SettingsOptionTextbox, {
                        title: 'Change Interval',
                        description: 'If Background changer is enabled, changes it every given seconds!',
                        type: 'number',
                        plugin: this.props.plugin,
                        lsNode: 'interval',
                        defaultValue: 3600,
                        apply: true,
                        onApply: () => console.log('Example Textbox was applied!')
                    }),
                ]
            })
        );
    }
}

exports.tab = SettingsTab