"""Run all finite model tests, including independently scoped game suites."""
import pathlib, subprocess

tests = sorted(str(p) for p in pathlib.Path('tests').rglob('*.test.mjs'))
assert tests, 'No deterministic tests found'
subprocess.run(['node', '--test', *tests], check=True)
