# Town Crier

A simple way to submit feedback to Atom or any installed package.

![Screen shot](https://user-images.githubusercontent.com/1038121/27665797-4b132932-5c24-11e7-892e-5c2f3caf722a.png "Screen shot")

## Use

1. Use the [GitHub package](https://github.com/atom/github) to sign in to your GitHub account
1. Execute any of the commands shown in [Commands](#commands) below

## Commands

Execute any of the commands by opening the [Command Palette](http://flight-manual.atom.io/getting-started/sections/atom-basics/#command-palette) and searching for the name of the command:

* **Town Crier: Create Bug** &mdash; Opens a new bug report

## Testing

When testing the issue creation flow, it is useful to direct the creation of new issues to a test repository so as to not create noise in normal package repositories. When in [Dev Mode](http://flight-manual.atom.io/hacking-atom/sections/contributing-to-official-atom-packages/#running-in-development-mode) town-crier will add a special package name to the list of available packages: `test-creating-issues-here`. This package will direct issues creation to the repo at `https://github.com/${process.env.TOWN_CRIER_TEST_REPO}/`.

## License

[MIT](LICENSE.md)
