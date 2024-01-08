import errorCreator from "../../lib/errorCreator.js";

export default function checkFilter(req, res, next) {
  const { limit, page } = req.params;

  if (typeof limit !== "undefined" && isNaN(+limit))
    return next(errorCreator("<limit> should be a number", 400));
  if ((typeof page !== "undefined" && isNaN(+page)) || +page < 1)
    return next(errorCreator("<page> should be a number greater than 0", 400));

  next();
}
