import expandFlatTree from './expandFlatTree';

// TODO: Should write more tests
test('expandFlatTree should expand', () => {
    const actual = expandFlatTree([
        'abc.txt',
        'abc/def.txt',
        'abc/def/ghi.txt',
        'xyz.txt',
        'abc/ghi/xyz.txt'
    ]);

    expect(actual).toEqual({
        'abc.txt': 'abc.txt',
        'abc': {
            'def': {
                'ghi.txt': 'abc/def/ghi.txt'
            },
            'ghi': {
                'xyz.txt': 'abc/ghi/xyz.txt'
            },
            'def.txt': 'abc/def.txt'
        },
        'xyz.txt': 'xyz.txt'
    });
});
