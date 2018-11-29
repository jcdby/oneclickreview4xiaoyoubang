const OneClickReview = require("./oneClickReviewV2");

describe("OneClickReview v2", function () {
    it("should has command property of onClickReview", function () {
        const oneClickReview = new OneClickReview('rd');
        expect(oneClickReview.command).toBe('rd');
    });
    it('should has getter and setter', function () {
        const argOneClickReview = 'rd';
        const oneClickReview = new OneClickReview(argOneClickReview);
        oneClickReview.command = 'rr';
        expect(oneClickReview.command).toBe('rr');
    });
    it('should has a default command even if there is no input for constructor of OneClickReview', function () {
        const oneClickReview = new OneClickReview();
        const DEFAULT_COMMAND = 'rd';
        expect(oneClickReview.command).toBe(DEFAULT_COMMAND);
    });
    it('should according to command set up the correct task', function () {

    });
});